package com.bankresolve.config;

import com.bankresolve.security.UserPrincipal;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * AuditorAware implementation — provides the current auditor's username (email)
 * for Spring Data JPA auditing (@CreatedBy, @LastModifiedBy).
 */
@Component("auditorAwareImpl")
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.of("Anonymous user");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return Optional.ofNullable(userPrincipal.getEmail());
        } else if (principal instanceof String strPrincipal) {
            return Optional.of(strPrincipal);
        }

        return Optional.of("System");
    }
}
