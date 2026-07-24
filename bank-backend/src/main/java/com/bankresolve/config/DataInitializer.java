package com.bankresolve.config;

import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GrievanceRepository grievanceRepository;
    private final GrievanceHistoryRepository grievanceHistoryRepository;
    private final NotificationRepository notificationRepository;
    private final ContactRepository contactRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.data-initializer.clean-db:false}")
    private boolean cleanDb;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        if (cleanDb) {
            log.info("DataInitializer: cleanDb=true detected, clearing transactional database table contents...");
            grievanceHistoryRepository.deleteAllInBatch();
            notificationRepository.deleteAllInBatch();
            grievanceRepository.deleteAllInBatch();
            contactRepository.deleteAllInBatch();
            userRepository.deleteAllInBatch();
            log.info("DataInitializer: all table data cleared successfully.");
        }

        seedInitialUsers();
    }

    private void seedInitialUsers() {
        seedUserIfMissing("manager@bank.com", "SecureBank Manager", "password123", Role.MANAGER);
        seedUserIfMissing("staff@bank.com", "SecureBank Staff", "password123", Role.STAFF);
        seedUserIfMissing("customer@bank.com", "Demo Customer", "password123", Role.CUSTOMER);

        log.info("DataInitializer: verified and synced demo users");
    }

    private void seedUserIfMissing(String email, String name, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .fullName(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .enabled(true)
                .build();
        userRepository.save(user);
        log.info("DataInitializer: seeded user {}", email);
    }
}
