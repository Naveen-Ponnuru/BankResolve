package com.bankresolve.config;

import com.bankresolve.entity.Bank;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final BankRepository bankRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        seedBanks();
        seedInitialUsers();
    }

    private void seedBanks() {
        if (bankRepository.count() > 0) {
            log.info("DataInitializer: banks already seeded — skipping.");
            return;
        }

        Bank hdfc = Bank.builder().name("HDFC Bank").code("HDFC001").build();
        Bank icici = Bank.builder().name("ICICI Bank").code("ICICI001").build();
        Bank sbi = Bank.builder().name("SBI Bank").code("SBI001").build();
        Bank axis = Bank.builder().name("Axis Bank").code("AXIS001").build();

        bankRepository.save(hdfc);
        bankRepository.save(icici);
        bankRepository.save(sbi);
        bankRepository.save(axis);

        log.info("DataInitializer: seeded 4 banks (HDFC Bank, ICICI Bank, SBI, Axis Bank)");
    }

    private void seedInitialUsers() {
        Bank sbi = bankRepository.findByCode("SBI001").orElseThrow();

        seedUserIfMissing("admin@bank.com", "System Administrator", "password123", Role.ADMIN, sbi);
        seedUserIfMissing("manager@bank.com", "Bank Manager", "password123", Role.MANAGER, sbi);
        seedUserIfMissing("staff@bank.com", "Bank Staff", "password123", Role.STAFF, sbi);
        seedUserIfMissing("customer@bank.com", "Demo Customer", "password123", Role.CUSTOMER, sbi);

        log.info("DataInitializer: verified and synced demo users");
    }

    private void seedUserIfMissing(String email, String name, String password, Role role, Bank bank) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .fullName(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .enabled(true)
                .bank(bank)
                .build();
        userRepository.save(user);
        log.info("DataInitializer: seeded user {}", email);
    }
}
