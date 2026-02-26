package com.bankresolve.security;

import com.bankresolve.entity.User;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility to extract the current authenticated user's bankId and userId
 * directly from the database via SecurityContext email — never from the request.
 *
 * <p>This is the single source of truth for tenant isolation. Every service
 * method that touches bank-scoped data MUST use this utility.</p>
 */
@Component
@RequiredArgsConstructor
public class BankContextUtil {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated User entity (fetched from DB).
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No authenticated user in SecurityContext");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", auth.getName()));
    }

    /**
     * Get the bankId of the currently authenticated user.
     * @throws IllegalStateException if user has no bank assigned
     */
    public Long getCurrentBankId() {
        User user = getCurrentUser();
        if (user.getBank() == null) {
            throw new IllegalStateException("Authenticated user has no bank assigned");
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
