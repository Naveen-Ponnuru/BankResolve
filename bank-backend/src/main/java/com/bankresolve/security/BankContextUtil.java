package com.bankresolve.security;

import com.bankresolve.entity.User;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.util.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility to extract the current authenticated user's bankId and userId
 * directly from the database via SecurityContext email — never from the request.
 *
 * <p>This is the single source of truth for tenant isolation. Every service
 * method that touches bank-scoped data MUST use this utility.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BankContextUtil {

    private final UserRepository userRepository;
    private final AuditLogger auditLogger;

    /**
     * Get the currently authenticated User entity (fetched from DB).
     * @throws IllegalStateException if no authenticated user or user not found in DB.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new IllegalStateException("Access Denied: No authenticated user context found.");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", auth.getName()));
    }

    /**
     * Get the bankId of the currently authenticated user.
     * @throws IllegalStateException if user has no bank assigned.
     */
    public Long getCurrentBankId() {
        User user = getCurrentUser();
        if (user.getBank() == null) {
            log.error("Security Audit Fail: Authenticated user {} has no bank assigned.", user.getEmail());
            throw new IllegalStateException("Access Denied: User has no bank assignment.");
        }
        return user.getBank().getId();
    }

    /**
     * Get the userId of the currently authenticated user.
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Validate that the current user belongs to the target bank.
     * Use this for IDOR prevention in cross-tenant scenarios.
     * @throws org.springframework.security.access.AccessDeniedException if bank IDs mismatch.
     */
    public void validateBankAccess(Long targetBankId) {
        if (targetBankId == null) return;
        
        Long currentBankId = getCurrentBankId();
        if (!currentBankId.equals(targetBankId)) {
            User user = getCurrentUser();
            
            // Capture request details for audit log
            String method = "N/A";
            String endpoint = "N/A";
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                method = request.getMethod();
                endpoint = request.getRequestURI();
            }

            auditLogger.logSecurityViolation(
                "CROSS_BANK_ACCESS",
                user.getId(),
                currentBankId,
                method,
                endpoint,
                "Attempted access to foreign bank data (Target Bank ID: " + targetBankId + ")"
            );

            throw new org.springframework.security.access.AccessDeniedException("Cross-bank data access is strictly prohibited.");
        }
    }

    /**
     * Get the email of the currently authenticated user.
     */
    public String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No authenticated user in SecurityContext");
        }
        return auth.getName();
    }
}
