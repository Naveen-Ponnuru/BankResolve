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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
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

    private static final long SLA_HOURS_NORMAL = 48;
    private static final long SLA_HOURS_HIGH   = 24;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateReferenceNumber() {
        return "BRX-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String requireBankCode(User user, String roleName) {
        String code = user.getBankCode();
        if (code == null || code.isBlank()) {
            throw new IllegalStateException("Misconfiguration: " + roleName + " must have a valid bank code assigned.");
        }
        return code;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto createGrievance(String customerEmail, GrievanceRequestDto request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        String bankCodeToUse = request.getBankCode();
        if (bankCodeToUse == null || bankCodeToUse.isBlank()) {
            if (customer.getBank() != null) {
                bankCodeToUse = customer.getBank().getCode();
            } else {
                throw new IllegalArgumentException("Bank Code is required to file a grievance.");
            }
        }

        final String effectiveBankCode = bankCodeToUse;
        Bank bank = bankRepository.findByCode(effectiveBankCode)
                .orElseThrow(() -> new ResourceNotFoundException("Bank", "code", effectiveBankCode));

        // ── Phase 4: Priority Determination ──────────────────────────────────
        // Rules: category risk level + transaction amount → priority → assignee role
        Priority priority = determinePriority(request.getCategory(), request.getTransactionAmount());

        // Auto-assign HIGH priority grievances to a manager; others remain for staff pickup
        User assignedManager = null;
        if (priority == Priority.HIGH) {
            List<User> managers = userRepository.findByBankIdAndRole(bank.getId(), Role.MANAGER);
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
        long count = grievanceRepository.countByBankCode(bank.getCode()) + 1;
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
                .bankCode(bank.getCode())
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
        addHistoryRecord(saved, GrievanceStatus.FILED, customerEmail, "Grievance filed successfully.");

        // Notify customer
        notificationService.notifyUser(customer,
                "Your grievance has been filed. Ref: " + saved.getGrievanceNumber(),
                "GRIEVANCE_CREATED", saved.getId());

        // Notify relevant bank users via team broadcasting
        if (priority == Priority.HIGH) {
            notificationService.notifyBankRole(bank.getId(), Role.MANAGER,
                    "High priority grievance " + saved.getGrievanceNumber() + " has been filed and requires immediate attention.",
                    "GRIEVANCE_CREATED", saved.getId());
        } else {
            notificationService.notifyBankRole(bank.getId(), Role.STAFF,
                    "New grievance " + saved.getGrievanceNumber() + " has been filed at your bank.",
                    "GRIEVANCE_CREATED", saved.getId());
        }

        return mapToDto(saved);
    }

    /**
     * Determines grievance priority based on category risk and transaction amount.
     *
     * HIGH  → fraud, unauthorized transactions, account blocks, large amounts (≥ ₹1,00,000)
     * MEDIUM → ATM issues, cheque issues, mid-range amounts (≥ ₹10,000)
     * LOW   → everything else (UPI small fails, internet banking queries, etc.)
     */
    private Priority determinePriority(String category, java.math.BigDecimal amount) {
        if (category != null) {
            // HIGH risk categories — always escalate to manager
            if (category.matches(
                    "FRAUD|UNAUTHORIZED_TRANSACTION|ACCOUNT_BLOCK|CREDIT_CARD_FRAUD|" +
                    "UPI_FRAUD|PHISHING|IDENTITY_THEFT|ACCOUNT_COMPROMISED|" +
                    "CARD_BLOCKED|DEMAT_ISSUE")) {
                return Priority.HIGH;
            }
            // MEDIUM risk categories
            if (category.matches(
                    "ATM_CASH_NOT_DISPENSED|TRANSACTION_DISPUTE|CHEQUE_BOUNCE|" +
                    "LOAN_ISSUE|INTEREST_DISCREPANCY|NEFT_RTGS_ISSUE")) {
                return Priority.MEDIUM;
            }
        }

        // Amount-based escalation (overrides category if higher)
        if (amount != null) {
            if (amount.compareTo(new java.math.BigDecimal("100000")) >= 0) return Priority.HIGH;
            if (amount.compareTo(new java.math.BigDecimal("10000"))  >= 0) return Priority.MEDIUM;
        }

        return Priority.LOW;
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> listGrievances(String email, GrievanceStatus status, Priority priority) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Role role = user.getRole();
        List<Grievance> grievances;

        if (role == Role.ADMIN) {
            grievances = grievanceRepository.findAll();
        } else if (role == Role.CUSTOMER) {
            grievances = grievanceRepository.findByCustomerId(user.getId());
        } else if (role == Role.MANAGER) {
            String bankCode = requireBankCode(user, "MANAGER");
            // Manager dashboard: show escalated, high-priority, OR grievances they are assigned to/resolved (to see feedback)
            grievances = grievanceRepository.findByBankCode(bankCode).stream()
                    .filter(g -> g.getPriority() == Priority.HIGH 
                            || g.getStatus() == GrievanceStatus.ESCALATED
                            || (g.getAssignedManager() != null && g.getAssignedManager().getId().equals(user.getId()))
                            || (g.getResolvedBy() != null && g.getResolvedBy().getId().equals(user.getId())))
                    .collect(Collectors.toList());
        } else {
            // STAFF
            String bankCode = requireBankCode(user, "STAFF");
            List<Grievance> bankGrievances = grievanceRepository.findByBankCode(bankCode);
            grievances = bankGrievances.stream()
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

    // ─── Get by ID ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public GrievanceResponseDto getGrievanceById(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() == Role.CUSTOMER) {
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You can only view your own grievances.");
            }
        } else if (user.getRole() != Role.ADMIN) {
            String bankCode = requireBankCode(user, user.getRole().name());
            if (!bankCode.equals(grievance.getBankCode())) {
                throw new AccessDeniedException("Access denied: Grievance belongs to a different bank.");
            }
        }
        return mapToDto(grievance);
    }

    // ─── Forward to Manager ───────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto forwardToManager(Long id, String staffEmail) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", staffEmail));
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (staff.getRole() != Role.STAFF) {
            throw new AccessDeniedException("Only staff members can escalate grievances.");
        }
        String bankCode = requireBankCode(staff, "STAFF");
        if (!grievance.getBankCode().equals(bankCode)) {
            throw new AccessDeniedException("Cannot escalate grievance outside your bank.");
        }

        List<User> managers = userRepository.findByRoleAndBankCode(Role.MANAGER, bankCode);
        if (managers.isEmpty()) {
            throw new IllegalStateException("No managers available for bank: " + bankCode);
        }

        grievance.setStatus(GrievanceStatus.ESCALATED);
        grievance.setAssignedManager(managers.get(0));
        Grievance saved = grievanceRepository.save(grievance);
        addHistoryRecord(saved, GrievanceStatus.ESCALATED, staffEmail, "Escalated to Manager");

        if (saved.getBank() != null) {
            notificationService.notifyBankRole(saved.getBank().getId(), Role.MANAGER,
                    "Grievance " + saved.getGrievanceNumber() + " has been escalated to managers. Ref: " + saved.getReferenceNumber(),
                    "GRIEVANCE_ESCALATED", saved.getId());
        }
        return mapToDto(saved);
    }

    // ─── Resolve ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public GrievanceResponseDto resolveGrievance(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() != Role.ADMIN &&
                (user.getBank() == null || !user.getBank().getId().equals(grievance.getBank().getId()))) {
            throw new AccessDeniedException("Unauthorized: restricted to assigned bank.");
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        Role role = user.getRole();
        if (role == Role.CUSTOMER) {

            throw new AccessDeniedException("Customers cannot update grievance status.");
        }
        if (role != Role.ADMIN) {
            String bankCode = requireBankCode(user, role.name());
            if (!bankCode.equals(grievance.getBankCode())) {
                throw new AccessDeniedException("Access denied: different bank.");
            }
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
    public GrievanceSummaryDto getDashboardSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Role role = user.getRole();

        long total, pending, resolved, highRisk;

        if (role == Role.ADMIN) {
            total   = grievanceRepository.count();
            pending = grievanceRepository.countByStatus(GrievanceStatus.FILED)
                    + grievanceRepository.countByStatus(GrievanceStatus.ACCEPTED)
                    + grievanceRepository.countByStatus(GrievanceStatus.IN_PROGRESS);
            resolved = grievanceRepository.countByStatus(GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.findByPriority(Priority.HIGH).size();
        } else if (role == Role.CUSTOMER) {
            total    = grievanceRepository.countByCustomerId(user.getId());
            pending  = grievanceRepository.countByCustomerIdAndStatuses(user.getId(),
                        List.of(GrievanceStatus.FILED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS));
            resolved = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.RESOLVED);
            highRisk = 0;
        } else {
            String bankCode = requireBankCode(user, role.name());
            total    = grievanceRepository.countByBankCode(bankCode);
            pending  = grievanceRepository.countByBankCodeAndStatusIn(bankCode,
                        List.of(GrievanceStatus.FILED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS));
            resolved = grievanceRepository.countByBankCodeAndStatus(bankCode, GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.findByBankCodeAndPriority(bankCode, Priority.HIGH).size();
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Role role = user.getRole();

        List<Object[]> results;
        if (role == Role.ADMIN) {
            results = grievanceRepository.getGlobalMonthlyTrend();
        } else if (role == Role.CUSTOMER) {
            results = grievanceRepository.getCustomerMonthlyTrend(user.getId());
        } else {
            String bankCode = requireBankCode(user, role.name());
            results = grievanceRepository.getBankMonthlyTrend(bankCode);
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (!grievance.getCustomer().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only give feedback on your own grievances.");
        }
        if (grievance.getStatus() != GrievanceStatus.RESOLVED) {
            throw new IllegalStateException("Feedback can only be submitted after the grievance is resolved.");
        }

        grievance.setFeedbackRating(feedback.getRating());
        grievance.setFeedbackComment(feedback.getComment());
        Grievance saved = grievanceRepository.save(grievance);

        // Notify the specific resolver about the feedback (Targeted Enterprise Notification)
        User resolver = saved.getResolvedBy();
        if (resolver != null) {
            notificationService.notifyUser(resolver,
                    "New feedback received for your resolution of grievance " + saved.getGrievanceNumber() + ": " + feedback.getRating() + " stars",
                    "GRIEVANCE_FEEDBACK", saved.getId());
        }

        return mapToDto(saved);
    }

    // ─── History ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceHistoryDto> getGrievanceHistory(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        if (user.getRole() == Role.CUSTOMER) {
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                throw new AccessDeniedException("You can only view history of your own grievances.");
            }
        } else if (user.getRole() != Role.ADMIN) {
            String bankCode = requireBankCode(user, user.getRole().name());
            if (!bankCode.equals(grievance.getBankCode())) {
                throw new AccessDeniedException("Access denied: Grievance belongs to a different bank.");
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
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));
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
                .bankCode(g.getBankCode())
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
                .targetSla(g.getTargetSla())
                .isEscalated(g.getIsEscalated())
                .updatedAt(g.getUpdatedAt())
                .updatedBy(g.getUpdatedBy())
                .assignedTo(g.getAssignedTo())
                .build();
    }
}
