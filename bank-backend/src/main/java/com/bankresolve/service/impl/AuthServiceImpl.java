package com.bankresolve.service.impl;

import com.bankresolve.dto.AuthResponseDto;
import com.bankresolve.dto.LoginRequestDto;
import com.bankresolve.dto.RegisterRequestDto;
import com.bankresolve.entity.Bank;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.BankRepository;
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
    private final BankRepository bankRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ─── Register ──────────────────────────────────────────────

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        // Guard: duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        // Guard: duplicate phone (mobile number)
        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()
                && userRepository.existsByPhone(request.getMobileNumber())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Mobile number already registered"
            );
        }

        // Resolve target role (default CUSTOMER for backward compatibility)
        Role resolvedRole = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        // Role-aware validation for bankId
        Long bankId = request.getBankId();
        boolean bankRequiredForRole = resolvedRole == Role.STAFF
                || resolvedRole == Role.MANAGER
                || resolvedRole == Role.ADMIN;
        if (bankRequiredForRole && bankId == null) {
            throw new IllegalArgumentException("Bank ID is required for STAFF, MANAGER, and ADMIN users.");
        }

        if (bankId != null) {
            // Validate against DB
            if (!bankRepository.existsById(bankId)) {
                throw new IllegalArgumentException("Invalid bank ID: " + bankId + ". Please select a valid bank.");
            }
        }

        // Resolve bank by id when provided (optional for CUSTOMER)
        Bank bank = null;
        if (bankId != null) {
            bank = bankRepository.findById(bankId)
                    .orElseThrow(() -> new ResourceNotFoundException("Bank", "id", bankId));
        }

        // Additional safety: non-customer roles must always be linked to a bank
        if (bankRequiredForRole && bank == null) {
            throw new IllegalStateException("Bank must not be null for STAFF, MANAGER, and ADMIN users.");
        }

        // Build and persist the new user with the resolved role
        User user = User.builder()
                .fullName(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getMobileNumber())
                .role(resolvedRole)
                .enabled(true)
                .bank(bank)
                .build();

        User savedUser = userRepository.save(user);

        Long resolvedBankId = savedUser.getBank() != null ? savedUser.getBank().getId() : null;
        String jwtToken = generateToken(savedUser, resolvedBankId);
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

        Long bankId = user.getBank() != null ? user.getBank().getId() : null;
        String jwtToken = generateToken(user, bankId);
        return buildAuthResponse(user, jwtToken);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateToken(User user, Long bankId) {
        return jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                "ROLE_" + user.getRole().name(),
                bankId
        );
    }

    private AuthResponseDto buildAuthResponse(User user, String token) {
        AuthResponseDto.UserDto userDto = AuthResponseDto.UserDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .bankId(user.getBank() != null ? user.getBank().getId() : null)
                .bankName(user.getBank() != null ? user.getBank().getName() : null)
                .build();

        return AuthResponseDto.builder()
                .jwtToken(token)
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .bankId(user.getBank() != null ? user.getBank().getId() : null)
                .bankName(user.getBank() != null ? user.getBank().getName() : null)
                .user(userDto)
                .build();
    }
}
