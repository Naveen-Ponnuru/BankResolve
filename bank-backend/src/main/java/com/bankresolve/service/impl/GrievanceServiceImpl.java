package com.bankresolve.service.impl;

import com.bankresolve.dto.GrievanceFeedbackDto;
import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.dto.GrievanceResponseDto;
import com.bankresolve.dto.MonthlyTrendDto;
import com.bankresolve.entity.Bank;
import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.GrievanceService;
import com.bankresolve.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrievanceServiceImpl implements GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;
    private final NotificationService notificationService;

    private static final Set<String> FRAUD_CATEGORIES = Set.of(
            "UPI_FRAUD", "CREDIT_CARD_FRAUD", "DEBIT_CARD_FRAUD"
    );

    // ─── Bank Code Resolution Helper ──────────────────────────────────────────

    /**
     * Resolves the bank code for a user, preferring the denormalized bankCode field,
     * then falling back to the bank relationship. Throws if the role requires a bank.
     */
    private String resolveBankCode(User user) {
        String bankCode = user.getBankCode();
        if (bankCode == null && user.getBank() != null) {
            bankCode = user.getBank().getCode();
        }
        return bankCode;
    }

    private String requireBankCode(User user, String role) {
        String bankCode = resolveBankCode(user);
        if (bankCode == null || bankCode.isBlank()) {
            throw new IllegalStateException(role + " must have a bank assigned. No bankCode found for user: " + user.getEmail());
        }
        return bankCode;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> listGrievances(String email, GrievanceStatus status, Priority priority) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        com.bankresolve.entity.enums.Role role = user.getRole();
        List<Grievance> grievances;

        if (role == com.bankresolve.entity.enums.Role.ADMIN) {
            // ADMIN: global visibility across ALL banks
            if (status != null) {
                grievances = grievanceRepository.findByStatus(status);
            } else if (priority != null) {
                grievances = grievanceRepository.findByPriority(priority);
            } else {
                grievances = grievanceRepository.findAll();
            }
        } else if (role == com.bankresolve.entity.enums.Role.CUSTOMER) {
            // CUSTOMER: strictly only their own grievances (no bankCode filter needed — user.id is the scope)
            if (status != null) {
                grievances = grievanceRepository.findByCustomerIdAndStatus(user.getId(), status);
            } else if (priority != null) {
                grievances = grievanceRepository.findByCustomerIdAndPriority(user.getId(), priority);
            } else {
                grievances = grievanceRepository.findByCustomerId(user.getId());
            }
        } else {
            // STAFF and MANAGER: filter strictly by user's own bank code
            // bankCode is ALWAYS derived from the authenticated user — never from the request payload
            String bankCode = requireBankCode(user, role.name());
            if (status != null) {
                grievances = grievanceRepository.findByBankCodeAndStatus(bankCode, status);
            } else if (priority != null) {
                grievances = grievanceRepository.findByBankCodeAndPriority(bankCode, priority);
            } else {
                grievances = grievanceRepository.findByBankCode(bankCode);
            }
        }

        return grievances.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public GrievanceResponseDto createGrievance(String customerEmail, GrievanceRequestDto request) {
        User user = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        // Derive bankCode from authenticated user's associated bank
        Bank bank = user.getBank();
        if (bank == null) {
            throw new IllegalStateException("User is not associated with any bank");
        }

        String referenceNumber = generateReferenceNumber(bank.getCode());
        Priority priority = determinePriority(request.getTransactionAmount(), request.getCategory());
        
        // SLA Calculation: High priority = 48 hours, Normal = 7 days
        Instant targetSla = Instant.now().plus(
                priority == Priority.HIGH ? java.time.Duration.ofHours(48) : java.time.Duration.ofDays(7)
        );

        Grievance grievance = Grievance.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .transactionAmount(request.getTransactionAmount())
                .referenceNumber(referenceNumber)
                .bankCode(bank.getCode()) // Enforce derived bankCode
                .customer(user)
                .bank(bank)
                .status(GrievanceStatus.FILED)
                .priority(priority)
                .targetSla(targetSla)
                .isEscalated(false)
                .build();

        Grievance saved = grievanceRepository.save(grievance);
        
        // Notify Customer
        notificationService.notifyUser(user, 
                "Your grievance has been filed successfully. Ref: " + saved.getReferenceNumber(),
                "GRIEVANCE_FILED", saved.getId());

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional
    public GrievanceResponseDto forwardToManager(Long id, String staffEmail) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", staffEmail));

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        // Tenancy check: staff must belong to the same bank as the grievance
        if (!staff.getBank().getId().equals(grievance.getBank().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Grievance belongs to another bank");
        }

        // Only STAFF can forward as per clean implementation rules
        if (staff.getRole() != com.bankresolve.entity.enums.Role.STAFF) {
            throw new org.springframework.security.access.AccessDeniedException("Only staff members can escalate grievances to managers");
        }

        // Find the first manager in the same bank
        List<User> managers = userRepository.findByBankIdAndRole(staff.getBank().getId(), com.bankresolve.entity.enums.Role.MANAGER);
        if (managers.isEmpty()) {
            throw new IllegalStateException("No manager found for this bank branch to handle escalation.");
        }

        grievance.setStatus(GrievanceStatus.ESCALATED);
        grievance.setAssignedManager(managers.get(0));
        
        Grievance saved = grievanceRepository.save(grievance);

        // Notify Manager
        if (saved.getAssignedManager() != null) {
            notificationService.notifyUser(saved.getAssignedManager(), 
                    "A grievance has been escalated to you. Ref: " + saved.getReferenceNumber(),
                    "GRIEVANCE_ESCALATED", saved.getId());
        }

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional
    public GrievanceResponseDto resolveGrievance(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        // Tenancy check
        if (user.getRole() != com.bankresolve.entity.enums.Role.ADMIN && 
            (user.getBank() == null || !user.getBank().getId().equals(grievance.getBank().getId()))) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Access restricted to assigned bank residency");
        }

        // Priority-based Resolution Rules
        if (grievance.getPriority() == Priority.HIGH) {
            // HIGH priority → Only MANAGER or ADMIN
            if (user.getRole() == com.bankresolve.entity.enums.Role.STAFF) {
                throw new org.springframework.security.access.AccessDeniedException("Access Denied: STAFF can only resolve NORMAL priority grievances. HIGH priority must be forwarded to a MANAGER.");
            }
            if (user.getRole() != com.bankresolve.entity.enums.Role.MANAGER && user.getRole() != com.bankresolve.entity.enums.Role.ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException("Resolution Policy: HIGH priority grievances require Manager or Admin approval.");
            }
        } else {
            // NORMAL priority → STAFF or MANAGER (or ADMIN)
            if (user.getRole() != com.bankresolve.entity.enums.Role.STAFF && 
                user.getRole() != com.bankresolve.entity.enums.Role.MANAGER && 
                user.getRole() != com.bankresolve.entity.enums.Role.ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You do not have resolution permissions.");
            }
        }

        grievance.setStatus(GrievanceStatus.RESOLVED);
        grievance.setResolvedAt(java.time.Instant.now());
        grievance.setResolvedBy(user);
        grievance.setResolvedRole(user.getRole());
        
        Grievance saved = grievanceRepository.save(grievance);

        // Notify Customer of resolution
        notificationService.notifyUser(saved.getCustomer(), 
                "Your grievance " + saved.getReferenceNumber() + " has been RESOLVED.",
                "GRIEVANCE_RESOLVED", saved.getId());

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public com.bankresolve.dto.GrievanceSummaryDto getDashboardSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        com.bankresolve.entity.enums.Role role = user.getRole();

        long total, pending, resolved, highRisk;

        if (role == com.bankresolve.entity.enums.Role.ADMIN) {
            // ADMIN: aggregate across ALL banks (no bankCode filter)
            total = grievanceRepository.count();
            pending = grievanceRepository.countByStatuses(List.of(GrievanceStatus.FILED, GrievanceStatus.PENDING));
            resolved = grievanceRepository.countByStatus(GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.countByStatus(GrievanceStatus.ESCALATED);
        } else if (role == com.bankresolve.entity.enums.Role.CUSTOMER) {
            // CUSTOMER: strictly their own grievances only
            total = grievanceRepository.countByCustomerId(user.getId());
            pending = grievanceRepository.countByCustomerIdAndStatuses(user.getId(), List.of(GrievanceStatus.FILED, GrievanceStatus.PENDING));
            resolved = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.ESCALATED);
        } else {
            // STAFF and MANAGER: bankCode strictly from server-side user.getBank().getCode()
            String bankCode = requireBankCode(user, role.name());
            total = grievanceRepository.countByBankCodeAndStatusIn(bankCode,
                        List.of(GrievanceStatus.FILED, GrievanceStatus.PENDING, GrievanceStatus.RESOLVED, GrievanceStatus.ESCALATED, GrievanceStatus.REJECTED));
            pending = grievanceRepository.countByBankCodeAndStatusIn(bankCode, List.of(GrievanceStatus.FILED, GrievanceStatus.PENDING));
            resolved = grievanceRepository.countByBankCodeAndStatus(bankCode, GrievanceStatus.RESOLVED);
            highRisk = grievanceRepository.countByBankCodeAndStatus(bankCode, GrievanceStatus.ESCALATED);
        }

        return com.bankresolve.dto.GrievanceSummaryDto.builder()
                .total(total)
                .pending(pending)
                .resolved(resolved)
                .highRisk(highRisk)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.bankresolve.dto.MonthlyTrendDto> getMonthlyTrend(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        com.bankresolve.entity.enums.Role role = user.getRole();
        List<Object[]> results;

        if (role == com.bankresolve.entity.enums.Role.ADMIN) {
            // ADMIN: global trend across all banks
            results = grievanceRepository.getGlobalMonthlyTrend();
        } else if (role == com.bankresolve.entity.enums.Role.CUSTOMER) {
            // CUSTOMER: their own grievance trend
            results = grievanceRepository.getCustomerMonthlyTrend(user.getId());
        } else {
            // STAFF and MANAGER: bankCode from server-side user — never the frontend payload
            String bankCode = requireBankCode(user, role.name());
            results = grievanceRepository.getBankMonthlyTrend(bankCode);
        }

        return results.stream()
                .map(row -> com.bankresolve.dto.MonthlyTrendDto.builder()
                        .month((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GrievanceResponseDto submitFeedback(Long id, com.bankresolve.dto.GrievanceFeedbackDto feedback, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        // Security/Residency check
        if (!grievance.getCustomer().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Feedback Policy: Only the customer who filed the grievance can provide feedback.");
        }

        // Status check
        if (grievance.getStatus() != GrievanceStatus.RESOLVED) {
            throw new IllegalStateException("Feedback can only be provided for resolved grievances.");
        }

        // Duplicate check
        if (grievance.getFeedbackRating() != null) {
            throw new IllegalStateException("Feedback has already been submitted for this grievance.");
        }

        // Rating validation (redundant with DTO but safe for internal calls)
        if (feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }

        grievance.setFeedbackRating(feedback.getRating());
        grievance.setFeedbackComment(feedback.getComment());

        Grievance saved = grievanceRepository.save(grievance);
        return mapToResponseDto(saved);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateReferenceNumber(String bankCode) {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String referenceNumber;
        boolean isUnique;
        int attempts = 0;
        
        do {
            String randomPart = String.format("%06d", new Random().nextInt(1000000));
            referenceNumber = String.format("%s-%s-%s", bankCode, datePart, randomPart);
            isUnique = !grievanceRepository.existsByReferenceNumber(referenceNumber);
            attempts++;
            if (attempts > 5) { // Fallback if extremely unlucky
                 randomPart = String.format("%08d", new Random().nextInt(100000000));
                 referenceNumber = String.format("%s-%s-%s", bankCode, datePart, randomPart);
            }
        } while (!isUnique && attempts < 10);

        return referenceNumber;
    }

    private Priority determinePriority(BigDecimal amount, String category) {
        if (amount != null && amount.compareTo(new BigDecimal("100000")) > 0) {
            return Priority.HIGH;
        }
        if (category != null && FRAUD_CATEGORIES.contains(category.toUpperCase())) {
            return Priority.HIGH;
        }
        return Priority.NORMAL;
    }

    @Override
    @Transactional(readOnly = true)
    public GrievanceResponseDto getGrievanceById(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        // ─── Tenancy: bankCode ALWAYS derived from server-side user — never from frontend ───────
        if (user.getRole() == com.bankresolve.entity.enums.Role.CUSTOMER) {
            // CUSTOMER: must own the grievance
            if (!grievance.getCustomer().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You can only view your own grievances.");
            }
        } else if (user.getRole() != com.bankresolve.entity.enums.Role.ADMIN) {
            // STAFF and MANAGER: bankCode from user entity — grievance must belong to same bank
            String userBankCode = requireBankCode(user, user.getRole().name());
            if (!userBankCode.equals(grievance.getBankCode())) {
                throw new AccessDeniedException("Access denied: Grievance belongs to a different bank.");
            }
        }
        // ADMIN: no bankCode restriction


        return mapToResponseDto(grievance);
    }

    private GrievanceResponseDto mapToResponseDto(Grievance grievance) {
        return GrievanceResponseDto.builder()
                .id(grievance.getId())
                .referenceNumber(grievance.getReferenceNumber())
                .title(grievance.getTitle())
                .description(grievance.getDescription())
                .category(grievance.getCategory())
                .transactionAmount(grievance.getTransactionAmount())
                .bankCode(grievance.getBankCode())
                .status(grievance.getStatus())
                .priority(grievance.getPriority())
                .customerId(grievance.getCustomer().getId())
                .customerName(grievance.getCustomer().getFullName())
                .assignedStaffId(grievance.getAssignedStaff() != null ? grievance.getAssignedStaff().getId() : null)
                .assignedStaffName(grievance.getAssignedStaff() != null ? grievance.getAssignedStaff().getFullName() : null)
                .assignedManagerId(grievance.getAssignedManager() != null ? grievance.getAssignedManager().getId() : null)
                .assignedManagerName(grievance.getAssignedManager() != null ? grievance.getAssignedManager().getFullName() : null)
                .createdAt(grievance.getCreatedAt())
                .resolvedAt(grievance.getResolvedAt())
                .resolvedById(grievance.getResolvedBy() != null ? grievance.getResolvedBy().getId() : null)
                .resolvedByName(grievance.getResolvedBy() != null ? grievance.getResolvedBy().getFullName() : null)
                .resolvedRole(grievance.getResolvedRole())
                .feedbackRating(grievance.getFeedbackRating())
                .feedbackComment(grievance.getFeedbackComment())
                .targetSla(grievance.getTargetSla())
                .isEscalated(grievance.getIsEscalated())
                .build();
    }
}
