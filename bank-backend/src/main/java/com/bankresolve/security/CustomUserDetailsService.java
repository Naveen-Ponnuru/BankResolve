package com.bankresolve.security;

import com.bankresolve.entity.User;
import com.bankresolve.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Loads user details from the database for Spring Security authentication.
 * Looks up by email (our login identifier) and maps the {@link com.bankresolve.entity.enums.Role}
 * to a Spring Security {@link GrantedAuthority} with the "ROLE_" prefix.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email));

        if (!user.getEnabled()) {
            throw new UsernameNotFoundException("User account is deactivated: " + email);
        }

        return new UserPrincipal(user);
    }
}
