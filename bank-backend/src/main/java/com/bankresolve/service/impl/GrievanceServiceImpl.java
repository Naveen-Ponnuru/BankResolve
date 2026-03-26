package com.bankresolve.service.impl;

import com.bankresolve.dto.GrievanceFeedbackDto;
import com.bankresolve.dto.GrievanceHistoryDto;
import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.dto.GrievanceResponseDto;
import com.bankresolve.dto.GrievanceSummaryDto;
import com.bankresolve.dto.MonthlyTrendDto;
import com.bankresolve.entity.Bank;
import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.GrievanceHistory;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.repository.GrievanceHistoryRepository;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.GrievanceService;
import com.bankresolve.service.NotificationService;
import com.bankresolve.security.BankContextUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrievanceServiceImpl implements GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final GrievanceHistoryRepository grievanceHistoryRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;
    private final NotificationService notificationService;
    private final BankContextUtil bankContextUtil;

    private static final long SLA_HOURS_NORMAL = 48;
    private static final long SLA_HOURS_HIGH   = 24;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateReferenceNumber() {
        return "BRX-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto createGrievance(String customerEmail, GrievanceRequestDto request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        // 🛡️ ZERO-TRUST: Derive bankId exclusively from authenticated user context
        if (customer.getBank() == null || customer.getBank().getId() == null) {
            log.warn("Security Alert: User {} attempted to file grievance with no bank assigned (orphan account).", customerEmail);
            throw new AccessDeniedException("Access Denied: Your account must be associated with a bank to file a grievance. Please contact support.");
        }

        Bank bank = customer.getBank();
        Long bankId = bank.getId();

        // ── Phase 4: Priority Determination ──────────────────────────────────
        Priority priority = determinePriority(request.getCategory(), request.getTransactionAmount());

        // Auto-assign HIGH priority grievances to a manager; others remain for staff pickup
        User assignedManager = null;
        if (priority == Priority.HIGH) {
            List<User> managers = userRepository.findByBankIdAndRole(bankId, Role.MANAGER);
            if (!managers.isEmpty()) {
                assignedManager = managers.get(0);
            }
        }

        // ── Phase 5: SLA Deadline ─────────────────────────────────────────────
        int slaDays = switch (priority) {
            case HIGH   -> 3;
            case MEDIUM -> 5;
            default     -> 7;   // LOW / NORMAL
        };
        java.time.LocalDateTime slaDeadline = java.time.LocalDateTime.now().plusDays(slaDays);

        // ── Phase 3: Generate Grievance Number ────────────────────────────────
        long count = grievanceRepository.countByBankId(bankId) + 1;
        String grievanceNumber = String.format("GRV-%s-%d-%06d",
                bank.getCode().toUpperCase(),
                java.time.Year.now().getValue(),
                count);

        Grievance grievance = Grievance.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .transactionAmount(request.getTransactionAmount())
                .bank(bank)
                .customer(customer)
                .priority(priority)
                .slaDeadline(slaDeadline)
                .status(GrievanceStatus.FILED)
                .referenceNumber(generateReferenceNumber())
                .grievanceNumber(grievanceNumber)
                .assignedManager(assignedManager)
                .build();
        grievance.setCreatedBy(customerEmail);

        Grievance saved = grievanceRepository.save(grievance);
        
        // 📝 AUDIT LOG: Production-grade visibility
        log.info("Grievance Created | ID: {} | Ref: {} | User: {} | Bank: {} (ID: {})", 
                saved.getId(), saved.getGrievanceNumber(), customerEmail, bank.getName(), bankId);
        addHistoryRecord(saved, GrievanceStatus.FILED, customerEmail, "Grievance filed successfully.");

        // Notify customer
        notificationService.notifyUser(customer,
                "Your grievance has been filed. Ref: " + saved.getGrievanceNumber(),
                "GRIEVANCE_CREATED", saved.getId());

        // Notify relevant bank users via team broadcasting
        // bankId is already defined above

        // STAFF gets notified for every new grievance (so they can assign/review)
        notificationService.notifyBankRole(bankId, Role.STAFF,
                "New grievance: " + saved.getTitle(),
                "GRIEVANCE_CREATED", saved.getId());

        // MANAGER gets notified for HIGH priority grievances
        if (saved.getPriority() == Priority.HIGH) {
            if (saved.getAssignedManager() != null) {
                notificationService.notifyUser(saved.getAssignedManager(),
                        "High priority grievance assigned to you: " + saved.getTitle(),
                        "GRIEVANCE_CREATED", saved.getId());
            } else {
                notificationService.notifyBankRole(bankId, Role.MANAGER,
                        "High priority grievance: " + saved.getTitle(),
                        "GRIEVANCE_CREATED", saved.getId());
            }
        }

        return mapToDto(saved);
    }

    private Priority determinePriority(String category, java.math.BigDecimal amount) {
        // Amount-based decision threshold: < 50,000 handled by Staff (LOW/MEDIUM)
        // >= 50,000 escalated to Manager (HIGH)
        if (amount != null) {
            if (amount.compareTo(new java.math.BigDecimal("50000")) >= 0) {
                return Priority.HIGH;
            }
        }

        if (category != null) {
            // Category risk patterns (still useful for medium/low distinction)
            if (category.matches(
                    "FRAUD|UNAUTHORIZED_TRANSACTION|ACCOUNT_BLOCK|CREDIT_CARD_FRAUD|" +
                    "UPI_FRAUD|PHISHING|IDENTITY_THEFT|ACCOUNT_COMPROMISED|" +
                    "CARD_BLOCKED|DEMAT_ISSUE")) {
                // If amount is high (>= threshold), it's already caught above.
                // If amount is low (< 50k), it becomes MEDIUM to ensure staff handles it.
                return Priority.MEDIUM;
            }
            if (category.matches(
                    "ATM_CASH_NOT_DISPENSED|TRANSACTION_DISPUTE|CHEQUE_BOUNCE|" +
                    "LOAN_ISSUE|INTEREST_DISCREPANCY|NEFT_RTGS_ISSUE")) {
                return Priority.MEDIUM;
            }
        }

        return Priority.LOW;
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> listGrievances(String email, GrievanceStatus status, Priority priority) {
        User user = bankContextUtil.getCurrentUser();
        Role role = user.getRole();
        List<Grievance> grievances;

        if (role == Role.ADMIN) {
            // ADMIN ONLY
            grievances = grievanceRepository.findAll();
        } else if (role == Role.CUSTOMER) {
            grievances = grievanceRepository.findByCustomerId(user.getId());
        } else if (role == Role.MANAGER) {
            Long bankId = bankContextUtil.getCurrentBankId();
            grievances = grievanceRepository.findByBankId(bankId).stream()
                    .filter(g -> g.getPriority() == Priority.HIGH 
                            || g.getStatus() == GrievanceStatus.ESCALATED
                            || (g.getAssignedManager() != null && g.getAssignedManager().getId().equals(user.getId()))
                            || (g.getResolvedBy() != null && g.getResolvedBy().getId().equals(user.getId())))
                    .collect(Collectors.toList());
        } else {
            // STAFF
            Long bankId = bankContextUtil.getCurrentBankId();
            grievances = grievanceRepository.findByBankId(bankId).stream()
                    .filter(g -> g.getAssignedStaff() == null || g.getAssignedStaff().getId().equals(user.getId()))
                    .collect(Collectors.toList());
        }

        // Apply filters
        if (status != null) {
            grievances = grievances.stream().filter(g -> g.getStatus() == status).collect(Collectors.toList());
        }
        if (priority != null) {
            grievances = grievances.stream().filter(g -> g.getPriority() == priority).collect(Collectors.toList());
        }

        return grievances.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GrievanceResponseDto> listGrievancesPaged(String email, GrievanceStatus status, Priority priority, Pageable pageable) {
        // Implementation that wraps the existing filtered list.
        // For Phase 11 hardening, this provides a standard Paged response.
        List<GrievanceResponseDto> all = listGrievances(email, status, priority);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), all.size());
        
        if (start > all.size()) {
            return new PageImpl<>(java.util.Collections.emptyList(), pageable, all.size());
        }
        
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    // ─── Get by ID ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public GrievanceResponseDto getGrievanceById(Long id, String email) {
        User user = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() == Role.CUSTOMER) {
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                log.warn("🚨 IDOR Attempt: Customer {} (ID: {}) tried to access grievance ID: {} belonging to Customer ID: {}", 
                        user.getEmail(), user.getId(), id, grievance.getCustomer().getId());
                throw new AccessDeniedException("Access denied: You can only view your own grievances.");
            }
        } else if (user.getRole() != Role.ADMIN) {
            bankContextUtil.validateBankAccess(grievance.getBank().getId());
        }
        return mapToDto(grievance);
    }

    // ─── Forward to Manager ───────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto forwardToManager(Long id, String staffEmail) {
        User staff = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        // ── Authorization: only STAFF can escalate ────────────────────────────
        if (staff.getRole() != Role.STAFF) {
            throw new AccessDeniedException("Only staff members can escalate grievances.");
        }
        
        bankContextUtil.validateBankAccess(grievance.getBank().getId());

        // ── Guard: prevent double-escalation ─────────────────────────────────
        if (grievance.getStatus() == GrievanceStatus.ESCALATED) {
            throw new IllegalStateException("Grievance is already escalated to a manager.");
        }
        if (grievance.getStatus() == GrievanceStatus.RESOLVED
                || grievance.getStatus() == GrievanceStatus.WITHDRAWN) {
            throw new IllegalStateException("Cannot escalate a " + grievance.getStatus() + " grievance.");
        }

        // ── Fetch managers ────────────────────────────────────────────────────
        List<User> managers = userRepository.findByBankIdAndRole(grievance.getBank().getId(), Role.MANAGER);
        if (managers.isEmpty()) {
            throw new IllegalStateException(
                "No manager is available in your bank to handle this escalation. " +
                "Please contact the admin.");
        }

        // ── Update status & assign ────────────────────────────────────────────
        grievance.setStatus(GrievanceStatus.ESCALATED);
        grievance.setAssignedManager(managers.get(0));
        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.ESCALATED, staffEmail, "Escalated to Manager by " + staffEmail);

        // ── Notify MANAGERs (explicitly assigned or broadcasting if none) ─────────────
        if (saved.getAssignedManager() != null) {
            notificationService.notifyUser(saved.getAssignedManager(),
                    "Grievance forwarded to you: " + saved.getTitle(),
                    "GRIEVANCE_ESCALATED", saved.getId());
        } else {
            notificationService.notifyBankRole(saved.getBank().getId(), Role.MANAGER,
                    "Grievance forwarded: " + saved.getTitle(),
                    "GRIEVANCE_ESCALATED", saved.getId());
        }

        // ── Notify the forwarding STAFF that action succeeded ─────────────────
        notificationService.notifyUser(staff,
                "You escalated grievance '" + saved.getTitle() + "' to the manager.",
                "GRIEVANCE_ESCALATED", saved.getId());

        return mapToDto(saved);
    }

    // ─── Resolve ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto resolveGrievance(Long id, String userEmail) {
        User user = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() != Role.ADMIN) {
            bankContextUtil.validateBankAccess(grievance.getBank().getId());
        }

        if (grievance.getPriority() == Priority.HIGH) {
            if (user.getRole() == Role.STAFF) {
                throw new AccessDeniedException("STAFF cannot resolve HIGH priority grievances.");
            }
            if (user.getRole() != Role.MANAGER && user.getRole() != Role.ADMIN) {
                throw new AccessDeniedException("HIGH priority requires Manager or Admin.");
            }
        } else {
            if (user.getRole() != Role.STAFF && user.getRole() != Role.MANAGER && user.getRole() != Role.ADMIN) {
                throw new AccessDeniedException("Unauthorized: no resolution permissions.");
            }
        }

        grievance.setStatus(GrievanceStatus.RESOLVED);
        grievance.setResolvedAt(Instant.now());
        grievance.setResolvedBy(user);
        grievance.setResolvedRole(user.getRole());
        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.RESOLVED, userEmail, "Grievance resolved.");
        // Only notify if customer still exists (may be null due to ON DELETE SET NULL)
        if (saved.getCustomer() != null) {
            notificationService.notifyUser(saved.getCustomer(),
                    "Your grievance has been resolved. Ref: " + saved.getReferenceNumber(),
                    "GRIEVANCE_RESOLVED", saved.getId());
        }
        return mapToDto(saved);
    }

    // ─── Update Status ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto updateStatus(Long id, GrievanceStatus newStatus, String email) {
        User user = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        Role role = user.getRole();
        if (role == Role.CUSTOMER) {
            throw new AccessDeniedException("Customers cannot update grievance status.");
        }

        if (role != Role.ADMIN) {
            bankContextUtil.validateBankAccess(grievance.getBank().getId());
        }

        if (role == Role.STAFF) {
            if (grievance.getAssignedStaff() != null && !grievance.getAssignedStaff().getId().equals(user.getId())) {
                throw new AccessDeniedException("Staff can only update grievances assigned to them.");
            }
        }

        grievance.setStatus(newStatus);
        if ((newStatus == GrievanceStatus.ACCEPTED || newStatus == GrievanceStatus.IN_PROGRESS)
                && grievance.getAssignedStaff() == null) {
            grievance.setAssignedStaff(user);
            grievance.setAssignedTo(user.getEmail());
        }

        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, newStatus, email, "Status updated to " + newStatus);

        if ((newStatus == GrievanceStatus.ACCEPTED || newStatus == GrievanceStatus.IN_PROGRESS
                || newStatus == GrievanceStatus.RESOLVED) && saved.getCustomer() != null) {
            notificationService.notifyUser(saved.getCustomer(),
                    "Status updated to " + newStatus + " for grievance: " + saved.getReferenceNumber(),
                    "GRIEVANCE_UPDATED", saved.getId());
        }
        return mapToDto(saved);
    }

    // ─── Dashboard Summary ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardSummary", key = "#email")
    public GrievanceSummaryDto getDashboardSummary(String email) {
        User user = bankContextUtil.getCurrentUser();
        Role role = user.getRole();

        long total, pending, resolved, highRisk;
        if (role == Role.ADMIN) {
            total   = grievanceRepository.count();
            pending = grievanceRepository.countByStatus(GrievanceStatus.FILED)
                    + grievanceRepository.countByStatus(GrievanceStatus.ACCEPTED)
                    + grievanceRepository.countByStatus(GrievanceStatus.IN_PROGRESS);
            resolved = grievanceRepository.countByStatus(GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.countByPriority(Priority.HIGH);
        } else if (role == Role.CUSTOMER) {
            total    = grievanceRepository.countByCustomerId(user.getId());
            pending  = grievanceRepository.countByCustomerIdAndStatuses(user.getId(),
                        List.of(GrievanceStatus.FILED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS));
            resolved = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.RESOLVED);
            highRisk = 0;
        } else {
            Long bankId = bankContextUtil.getCurrentBankId();
            total    = grievanceRepository.countByBankId(bankId);
            pending  = grievanceRepository.countByBankIdAndStatuses(bankId,
                        List.of(GrievanceStatus.FILED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS));
            resolved = grievanceRepository.countByBankIdAndStatus(bankId, GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.countByBankIdAndPriority(bankId, Priority.HIGH);
        }

        return GrievanceSummaryDto.builder()
                .total(total)
                .pending(pending)
                .resolved(resolved)
                .highRisk(highRisk)
                .build();
    }

    // ─── Monthly Trend ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyTrendDto> getMonthlyTrend(String email) {
        User user = bankContextUtil.getCurrentUser();
        Role role = user.getRole();

        List<Object[]> results;
        if (role == Role.ADMIN) {
            results = grievanceRepository.getGlobalMonthlyTrend();
        } else if (role == Role.CUSTOMER) {
            results = grievanceRepository.getCustomerMonthlyTrend(user.getId());
        } else {
            Long bankId = bankContextUtil.getCurrentBankId();
            results = grievanceRepository.getBankMonthlyTrend(bankId);
        }

        return results.stream()
                .map(row -> MonthlyTrendDto.builder()
                        .month((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Feedback ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto submitFeedback(Long id, GrievanceFeedbackDto feedback, String email) {
        User user = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (!grievance.getCustomer().getId().equals(user.getId())) {
            log.warn("🚨 IDOR Attempt: Customer {} (ID: {}) tried to submit feedback for grievance ID: {} (Customer ID: {})", 
                    user.getEmail(), user.getId(), id, grievance.getCustomer().getId());
            throw new AccessDeniedException("You can only give feedback on your own grievances.");
        }
        if (grievance.getStatus() != GrievanceStatus.RESOLVED) {
            throw new IllegalStateException("Feedback can only be submitted after the grievance is resolved.");
        }

        grievance.setFeedbackRating(feedback.getRating());
        grievance.setFeedbackComment(feedback.getComment());
        grievance.setFeedbackAt(Instant.now());
        Grievance saved = grievanceRepository.save(grievance);

        // ── Build a readable feedback message snippet ─────────────────────────
        int rating = feedback.getRating() != null ? feedback.getRating() : 0;
        String ratingStars = "★".repeat(rating) + "☆".repeat(5 - rating);
        String commentPreview = feedback.getComment() != null && feedback.getComment().length() > 80
                ? feedback.getComment().substring(0, 80) + "…"
                : (feedback.getComment() != null ? feedback.getComment() : "No comment");
        String feedbackSummary = "Feedback on " + saved.getGrievanceNumber()
                + " — " + ratingStars
                + " | \"" + commentPreview + "\"";

        // ── Notify explicitly assigned personnel (Precision Routing) ───
        User resolver = saved.getResolvedBy();
        User assignedStaff = saved.getAssignedStaff();
        User assignedManager = saved.getAssignedManager();

        if (resolver != null) {
            notificationService.notifyUser(resolver,
                    "Customer rated your resolution: " + feedbackSummary,
                    "GRIEVANCE_FEEDBACK", saved.getId());
        }

        // Notify assigned staff if they are different from resolver
        if (assignedStaff != null && (resolver == null || !assignedStaff.getId().equals(resolver.getId()))) {
            notificationService.notifyUser(assignedStaff,
                    "Customer feedback received: " + feedbackSummary,
                    "GRIEVANCE_FEEDBACK", saved.getId());
        }

        // Notify assigned manager if they are different from resolver and staff
        if (assignedManager != null && (resolver == null || !assignedManager.getId().equals(resolver.getId())) && 
            (assignedStaff == null || !assignedManager.getId().equals(assignedStaff.getId()))) {
            notificationService.notifyUser(assignedManager,
                    "Customer feedback received: " + feedbackSummary,
                    "GRIEVANCE_FEEDBACK", saved.getId());
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> getRecentFeedback(String email) {
        User user = bankContextUtil.getCurrentUser();
        Role role = user.getRole();

        List<Grievance> feedbackGrievances;
        if (role == Role.ADMIN) {
            feedbackGrievances = grievanceRepository.findRecentFeedbackGlobal();
        } else {
            Long bankId = bankContextUtil.getCurrentBankId();
            feedbackGrievances = grievanceRepository.findRecentFeedbackByBankId(bankId);
        }

        return feedbackGrievances.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ─── History ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceHistoryDto> getGrievanceHistory(Long id, String email) {
        User user = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() == Role.CUSTOMER) {
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                throw new AccessDeniedException("You can only view history of your own grievances.");
            }
        } else if (user.getRole() != Role.ADMIN) {
            bankContextUtil.validateBankAccess(grievance.getBank().getId());
        }

        return grievanceHistoryRepository.findByGrievanceIdOrderByTimestampDesc(id)
                .stream()
                .map(h -> GrievanceHistoryDto.builder()
                        .id(h.getId())
                        .grievanceId(h.getGrievance().getId())
                        .status(h.getStatus())
                        .updatedBy(h.getUpdatedBy())
                        .timestamp(h.getTimestamp())
                        .note(h.getNote())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto withdrawGrievance(Long id, String customerEmail) {
        User customer = bankContextUtil.getCurrentUser();
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (!grievance.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You can only withdraw your own grievances.");
        }
        if (grievance.getStatus() == GrievanceStatus.RESOLVED
                || grievance.getStatus() == GrievanceStatus.WITHDRAWN) {
            throw new IllegalStateException("Cannot withdraw a grievance with status: " + grievance.getStatus());
        }

        grievance.setStatus(GrievanceStatus.WITHDRAWN);
        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.WITHDRAWN, customerEmail, "Grievance withdrawn by customer.");

        if (saved.getAssignedStaff() != null) {
            notificationService.notifyUser(saved.getAssignedStaff(),
                    "Customer withdrew grievance: " + saved.getReferenceNumber(),
                    "GRIEVANCE_WITHDRAWN", saved.getId());
        }
        return mapToDto(saved);
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    private void addHistoryRecord(Grievance grievance, GrievanceStatus status, String updatedBy, String note) {
        GrievanceHistory history = GrievanceHistory.builder()
                .grievance(grievance)
                .status(status)
                .updatedBy(updatedBy)
                .note(note)
                .timestamp(Instant.now())
                .build();
        grievanceHistoryRepository.save(history);
        grievance.setUpdatedAt(Instant.now());
        grievance.setUpdatedBy(updatedBy);
    }

    private GrievanceResponseDto mapToDto(Grievance g) {
        return GrievanceResponseDto.builder()
                .id(g.getId())
                .referenceNumber(g.getReferenceNumber())
                .grievanceNumber(g.getGrievanceNumber())
                .title(g.getTitle())
                .description(g.getDescription())
                .category(g.getCategory())
                .transactionAmount(g.getTransactionAmount())
                .bankId(g.getBank() != null ? g.getBank().getId() : null)
                .status(g.getStatus())
                .priority(g.getPriority())
                // customer may be null if user was deleted (ON DELETE SET NULL)
                .customerId(g.getCustomer() != null ? g.getCustomer().getId() : null)
                .customerName(g.getCustomer() != null ? g.getCustomer().getFullName() : "[Deleted User]")
                .assignedStaffId(g.getAssignedStaff() != null ? g.getAssignedStaff().getId() : null)
                .assignedStaffName(g.getAssignedStaff() != null ? g.getAssignedStaff().getFullName() : null)
                .assignedManagerId(g.getAssignedManager() != null ? g.getAssignedManager().getId() : null)
                .assignedManagerName(g.getAssignedManager() != null ? g.getAssignedManager().getFullName() : null)
                .createdAt(g.getCreatedAt())
                .resolvedAt(g.getResolvedAt())
                .resolvedById(g.getResolvedBy() != null ? g.getResolvedBy().getId() : null)
                .resolvedByName(g.getResolvedBy() != null ? g.getResolvedBy().getFullName() : null)
                .resolvedRole(g.getResolvedRole())
                .feedbackRating(g.getFeedbackRating())
                .feedbackComment(g.getFeedbackComment())
                .feedbackAt(g.getFeedbackAt())
                .targetSla(g.getTargetSla())
                .isEscalated(g.getIsEscalated())
                .updatedAt(g.getUpdatedAt())
                .updatedBy(g.getUpdatedBy())
                .assignedTo(g.getAssignedTo())
                .build();
    }
}
