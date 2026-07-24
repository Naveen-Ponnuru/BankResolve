package com.bankresolve.service.impl;

import com.bankresolve.dto.GrievanceFeedbackDto;
import com.bankresolve.dto.GrievanceHistoryDto;
import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.dto.GrievanceResponseDto;
import com.bankresolve.dto.GrievanceSummaryDto;
import com.bankresolve.dto.MonthlyTrendDto;
import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.GrievanceHistory;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.GrievanceHistoryRepository;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.GrievanceService;
import com.bankresolve.service.NotificationService;
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
    private final NotificationService notificationService;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateReferenceNumber() {
        return "BRX-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto createGrievance(String customerEmail, GrievanceRequestDto request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        // ── Phase 4: Priority Determination ──────────────────────────────────
        Priority priority = determinePriority(request.getCategory(), request.getTransactionAmount());

        // Auto-assign HIGH priority grievances to a manager; others remain for staff pickup
        User assignedManager = null;
        if (priority == Priority.HIGH) {
            List<User> managers = userRepository.findByRole(Role.MANAGER);
            if (!managers.isEmpty()) {
                assignedManager = managers.get(0);
            }
        }

        // ── Phase 3: Generate Grievance Number ────────────────────────────────
        long count = grievanceRepository.count() + 1;
        String grievanceNumber = String.format("GRV-%d-%06d",
                java.time.Year.now().getValue(),
                count);

        Grievance grievance = Grievance.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .transactionAmount(request.getTransactionAmount())
                .customer(customer)
                .priority(priority)
                .status(GrievanceStatus.FILED)
                .referenceNumber(generateReferenceNumber())
                .grievanceNumber(grievanceNumber)
                .assignedManager(assignedManager)
                .build();
        grievance.setCreatedBy(customerEmail);

        Grievance saved = grievanceRepository.save(grievance);
        
        // 📝 AUDIT LOG: Production-grade visibility
        log.info("Grievance Created | ID: {} | Ref: {} | User: {}", 
                saved.getId(), saved.getGrievanceNumber(), customerEmail);
        addHistoryRecord(saved, GrievanceStatus.FILED, customerEmail, "Grievance filed successfully.");

        // Notify customer
        notificationService.notifyUser(customer,
                "Your grievance has been filed. Ref: " + saved.getGrievanceNumber(),
                "GRIEVANCE_CREATED", saved.getId());

        // STAFF gets notified for every new grievance (so they can assign/review)
        notificationService.notifyRole(Role.STAFF,
                "New grievance: " + saved.getTitle(),
                "GRIEVANCE_CREATED", saved.getId());

        // MANAGER gets notified for HIGH priority grievances
        if (saved.getPriority() == Priority.HIGH) {
            if (saved.getAssignedManager() != null) {
                notificationService.notifyUser(saved.getAssignedManager(),
                        "High priority grievance assigned to you: " + saved.getTitle(),
                        "GRIEVANCE_CREATED", saved.getId());
            } else {
                notificationService.notifyRole(Role.MANAGER,
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
        User user = getCurrentUser(email);
        Role role = user.getRole();
        List<Grievance> grievances;

        if (role == Role.CUSTOMER) {
            grievances = grievanceRepository.findByCustomerId(user.getId());
        } else if (role == Role.MANAGER) {
            grievances = grievanceRepository.findAll();
        } else {
            // STAFF
            grievances = grievanceRepository.findAll();
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
        User user = getCurrentUser(email);
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() == Role.CUSTOMER) {
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                log.warn("🚨 IDOR Attempt: Customer {} (ID: {}) tried to access grievance ID: {} belonging to Customer ID: {}", 
                        user.getEmail(), user.getId(), id, grievance.getCustomer().getId());
                throw new AccessDeniedException("Access denied: You can only view your own grievances.");
            }
        }
        return mapToDto(grievance);
    }

    // ─── Forward to Manager ───────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto forwardToManager(Long id, String staffEmail) {
        User staff = getCurrentUser(staffEmail);
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        // ── Authorization: only STAFF can escalate ────────────────────────────
        if (staff.getRole() != Role.STAFF) {
            throw new AccessDeniedException("Only staff members can escalate grievances.");
        }

        // ── Guard: prevent double-escalation ─────────────────────────────────
        if (grievance.getStatus() == GrievanceStatus.ESCALATED) {
            throw new IllegalStateException("Grievance is already escalated to a manager.");
        }
        if (grievance.getStatus() == GrievanceStatus.RESOLVED
                || grievance.getStatus() == GrievanceStatus.WITHDRAWN) {
            throw new IllegalStateException("Cannot escalate a " + grievance.getStatus() + " grievance.");
        }

        // ── Fetch managers ────────────────────────────────────────────────────
        List<User> managers = userRepository.findByRole(Role.MANAGER);
        if (managers.isEmpty()) {
            throw new IllegalStateException(
                "No manager is available to handle this escalation. Please contact a system manager.");
        }

        // ── Update status, ownership & escalation flag ─────────────────────────
        grievance.setStatus(GrievanceStatus.ESCALATED);
        grievance.setIsEscalated(true);
        grievance.setAssignedManager(managers.get(0));
        grievance.setAssignedTo(managers.get(0).getEmail());
        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.ESCALATED, staffEmail, "Escalated to Manager by " + staffEmail);

        // ── Notify ALL MANAGERs via STOMP real-time WebSocket ─────────────────
        notificationService.notifyRole(Role.MANAGER,
                "Grievance " + saved.getReferenceNumber() + " escalated to management by staff: " + saved.getTitle(),
                "GRIEVANCE_ESCALATED", saved.getId());

        // ── Notify Customer ───────────────────────────────────────────────────
        if (saved.getCustomer() != null) {
            notificationService.notifyUser(saved.getCustomer(),
                    "Your grievance " + saved.getReferenceNumber() + " has been escalated to management for review.",
                    "GRIEVANCE_ESCALATED", saved.getId());
        }

        // ── Notify the forwarding STAFF ───────────────────────────────────────
        notificationService.notifyUser(staff,
                "You escalated grievance '" + saved.getTitle() + "' to the manager.",
                "GRIEVANCE_ESCALATED", saved.getId());

        return mapToDto(saved);
    }

    // ─── Resolve ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto resolveGrievance(Long id, String userEmail) {
        User user = getCurrentUser(userEmail);
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (grievance.getPriority() == Priority.HIGH) {
            if (user.getRole() == Role.STAFF) {
                throw new AccessDeniedException("STAFF cannot resolve HIGH priority grievances.");
            }
            if (user.getRole() != Role.MANAGER) {
                throw new AccessDeniedException("HIGH priority requires Manager.");
            }
        } else {
            if (user.getRole() != Role.STAFF && user.getRole() != Role.MANAGER) {
                throw new AccessDeniedException("Unauthorized: no resolution permissions.");
            }
        }

        grievance.setStatus(GrievanceStatus.RESOLVED);
        grievance.setResolvedAt(Instant.now());
        grievance.setResolvedBy(user);
        grievance.setResolvedRole(user.getRole());
        if (user.getRole() == Role.MANAGER) {
            grievance.setAssignedManager(user);
            grievance.setAssignedTo(user.getEmail());
        } else if (user.getRole() == Role.STAFF) {
            grievance.setAssignedStaff(user);
            grievance.setAssignedTo(user.getEmail());
        }

        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.RESOLVED, userEmail, "Grievance resolved by " + user.getRole());

        if (saved.getCustomer() != null) {
            notificationService.notifyUser(saved.getCustomer(),
                    "Your grievance has been resolved. Ref: " + saved.getReferenceNumber(),
                    "GRIEVANCE_STATUS_RESOLVED", saved.getId());
        }
        return mapToDto(saved);
    }

    // ─── Update Status ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto updateStatus(Long id, GrievanceStatus newStatus, String email) {
        User user = getCurrentUser(email);
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        Role role = user.getRole();
        if (role == Role.CUSTOMER) {
            throw new AccessDeniedException("Customers cannot update grievance status.");
        }

        if (role == Role.STAFF) {
            if (grievance.getAssignedStaff() != null && !grievance.getAssignedStaff().getId().equals(user.getId())) {
                throw new AccessDeniedException("Staff can only update grievances assigned to them.");
            }
        }

        grievance.setStatus(newStatus);
        if (newStatus == GrievanceStatus.ESCALATED) {
            grievance.setIsEscalated(true);
            List<User> managers = userRepository.findByRole(Role.MANAGER);
            if (!managers.isEmpty() && grievance.getAssignedManager() == null) {
                grievance.setAssignedManager(managers.get(0));
            }
            if (grievance.getAssignedManager() != null) {
                grievance.setAssignedTo(grievance.getAssignedManager().getEmail());
            }
            notificationService.notifyRole(Role.MANAGER,
                    "Grievance " + grievance.getReferenceNumber() + " escalated to management: " + grievance.getTitle(),
                    "GRIEVANCE_ESCALATED", grievance.getId());
        } else if (newStatus == GrievanceStatus.ACCEPTED || newStatus == GrievanceStatus.IN_PROGRESS) {
            if (role == Role.MANAGER) {
                grievance.setAssignedManager(user);
                grievance.setAssignedTo(user.getEmail());
            } else if (role == Role.STAFF) {
                if (grievance.getAssignedStaff() == null) {
                    grievance.setAssignedStaff(user);
                }
                grievance.setAssignedTo(user.getEmail());
            }
        } else if (newStatus == GrievanceStatus.RESOLVED) {
            grievance.setResolvedBy(user);
            grievance.setResolvedRole(role);
            grievance.setResolvedAt(Instant.now());
            if (role == Role.MANAGER) {
                grievance.setAssignedManager(user);
                grievance.setAssignedTo(user.getEmail());
            } else if (role == Role.STAFF) {
                grievance.setAssignedStaff(user);
                grievance.setAssignedTo(user.getEmail());
            }
        }

        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, newStatus, email, "Status updated to " + newStatus + " by " + role);

        if ((newStatus == GrievanceStatus.ACCEPTED || newStatus == GrievanceStatus.IN_PROGRESS
                || newStatus == GrievanceStatus.RESOLVED) && saved.getCustomer() != null) {
            notificationService.notifyUser(saved.getCustomer(),
                    "Status updated to " + newStatus + " for grievance: " + saved.getReferenceNumber(),
                    "GRIEVANCE_STATUS_" + newStatus, saved.getId());
        }
        return mapToDto(saved);
    }

    // ─── Dashboard Summary ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardSummary", key = "#email")
    public GrievanceSummaryDto getDashboardSummary(String email) {
        User user = getCurrentUser(email);
        Role role = user.getRole();

        long total, pending, resolved, highRisk;
        if (role == Role.CUSTOMER) {
            total    = grievanceRepository.countByCustomerId(user.getId());
            pending  = grievanceRepository.countByCustomerIdAndStatuses(user.getId(),
                        List.of(GrievanceStatus.FILED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS));
            resolved = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.RESOLVED);
            highRisk = 0;
        } else if (role == Role.MANAGER) {
            total    = grievanceRepository.countManagerScopedTotal();
            pending  = grievanceRepository.countManagerScopedByStatuses(
                        List.of(GrievanceStatus.FILED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS));
            resolved = grievanceRepository.countByResolvedRole(Role.MANAGER);
            highRisk = grievanceRepository.countManagerScopedByStatus(GrievanceStatus.ESCALATED);
        } else {
            // STAFF
            total    = grievanceRepository.count();
            pending  = grievanceRepository.countByStatus(GrievanceStatus.FILED)
                     + grievanceRepository.countByStatus(GrievanceStatus.ACCEPTED)
                     + grievanceRepository.countByStatus(GrievanceStatus.IN_PROGRESS);
            resolved = grievanceRepository.countByResolvedRole(Role.STAFF);
            highRisk = 0;
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
        User user = getCurrentUser(email);
        Role role = user.getRole();

        List<Object[]> results;
        if (role == Role.STAFF) {
            results = grievanceRepository.getGlobalMonthlyTrend();
        } else if (role == Role.CUSTOMER) {
            results = grievanceRepository.getCustomerMonthlyTrend(user.getId());
        } else {
            // MANAGER
            results = grievanceRepository.getManagerMonthlyTrend();
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
        User user = getCurrentUser(email);
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
        if (grievance.getFeedbackRating() != null) {
            throw new IllegalStateException("Feedback has already been submitted for this grievance.");
        }

        grievance.setFeedbackRating(feedback.getRating());
        grievance.setFeedbackComment(feedback.getComment());
        grievance.setFeedbackAt(Instant.now());
        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.RESOLVED, email, "Feedback submitted by customer: " + feedback.getRating() + "★");

        // ── Build a readable feedback message snippet ─────────────────────────
        int rating = feedback.getRating() != null ? feedback.getRating() : 0;
        String ratingStars = "★".repeat(rating) + "☆".repeat(5 - rating);
        String commentPreview = feedback.getComment() != null && feedback.getComment().length() > 80
                ? feedback.getComment().substring(0, 80) + "…"
                : (feedback.getComment() != null ? feedback.getComment() : "No comment");
        String feedbackSummary = "Feedback on " + saved.getGrievanceNumber()
                + " — " + ratingStars
                + " | \"" + commentPreview + "\"";

        // ── Route notification ONLY to the actual resolver ────────────────────
        User resolver = saved.getResolvedBy();
        if (resolver != null) {
            notificationService.notifyUser(resolver,
                    "Customer rated your resolution: " + feedbackSummary,
                    "GRIEVANCE_FEEDBACK", saved.getId());
        } else if (saved.getResolvedRole() == Role.MANAGER) {
            notificationService.notifyRole(Role.MANAGER,
                    "Customer feedback received: " + feedbackSummary,
                    "GRIEVANCE_FEEDBACK", saved.getId());
        } else if (saved.getResolvedRole() == Role.STAFF && saved.getAssignedStaff() != null) {
            notificationService.notifyUser(saved.getAssignedStaff(),
                    "Customer feedback received: " + feedbackSummary,
                    "GRIEVANCE_FEEDBACK", saved.getId());
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> getRecentFeedback(String email) {
        User user = getCurrentUser(email);
        Role role = user.getRole();
        List<Grievance> feedbackGrievances;

        if (role == Role.STAFF) {
            feedbackGrievances = grievanceRepository.findRecentFeedbackByResolver(Role.STAFF, user.getId());
        } else if (role == Role.MANAGER) {
            feedbackGrievances = grievanceRepository.findRecentFeedbackByResolver(Role.MANAGER, user.getId());
        } else {
            feedbackGrievances = grievanceRepository.findRecentFeedbackGlobal();
        }

        return feedbackGrievances.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ─── History ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceHistoryDto> getGrievanceHistory(Long id, String email) {
        User user = getCurrentUser(email);
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() == Role.CUSTOMER) {
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                throw new AccessDeniedException("You can only view history of your own grievances.");
            }
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
        User customer = getCurrentUser(customerEmail);
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
                .isEscalated(g.getIsEscalated())
                .updatedAt(g.getUpdatedAt())
                .updatedBy(g.getUpdatedBy())
                .assignedTo(g.getAssignedTo())
                .build();
    }
}
