package com.bankresolve.service.impl;

import com.bankresolve.dto.AuthResponseDto;
import com.bankresolve.dto.LoginRequestDto;
import com.bankresolve.dto.RegisterRequestDto;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.security.JwtService;
import com.bankresolve.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ─── Register ──────────────────────────────────────────────

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        // Guard: duplicate email
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already in use: " + normalizedEmail);
        }

        // Guard: duplicate phone (mobile number)
        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()
                && userRepository.existsByPhone(request.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already registered");
        }

        // Resolve target role from request, default to CUSTOMER if null
        Role resolvedRole = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        // Build and persist the new user with the resolved role
        User user = User.builder()
                .fullName(request.getName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getMobileNumber())
                .role(resolvedRole)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        String jwtToken = generateToken(savedUser);
        return buildAuthResponse(savedUser, jwtToken);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto request) {
        // Delegates to Spring Security (throws BadCredentialsException on failure)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (!user.getEnabled()) {
            throw new IllegalArgumentException("Account is inactive. Please contact support.");
        }

        String jwtToken = generateToken(user);
        return buildAuthResponse(user, jwtToken);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateToken(User user) {
        return jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                "ROLE_" + user.getRole().name()
        );
    }

    private AuthResponseDto buildAuthResponse(User user, String token) {
        AuthResponseDto.UserDto userDto = AuthResponseDto.UserDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return AuthResponseDto.builder()
                .jwtToken(token)
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .user(userDto)
                .build();
    }
}

