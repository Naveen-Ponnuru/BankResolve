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

/**
 * Seeds the database with initial data on application startup.
 *
 * Inserts:
 *  - 2 sample banks (SBI001, HDFC001) if the banks table is empty
 *  - 1 admin user (admin@bankresolve.com / Admin@1234) if no users exist
 *
 * Safe to rerun — all operations are guarded by existence checks.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final BankRepository bankRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedBanks();
        seedAdminUser();
    }

    // ─── Seed Banks ───────────────────────────────────────────────────────────

    private void seedBanks() {
        if (bankRepository.count() > 0) {
            log.info("DataInitializer: banks already seeded — skipping.");
            return;
        }

        Bank sbi = Bank.builder()
                .name("State Bank of India")
                .code("SBI001")
                .build();

        Bank hdfc = Bank.builder()
                .name("HDFC Bank")
                .code("HDFC001")
                .build();

        Bank icici = Bank.builder()
                .name("ICICI Bank")
                .code("ICICI001")
                .build();

        bankRepository.save(sbi);
        bankRepository.save(hdfc);
        bankRepository.save(icici);

        log.info("DataInitializer: seeded {} banks (SBI001, HDFC001, ICICI001)", 3);
    }

    // ─── Seed Admin User ──────────────────────────────────────────────────────

    private void seedAdminUser() {
        if (userRepository.count() > 0) {
            log.info("DataInitializer: users already exist — skipping admin seed.");
            return;
        }

        // Admin must belong to a bank — use the first available
        Bank firstBank = bankRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No banks found — run seedBanks() first"));

        User admin = User.builder()
                .fullName("System Administrator")
                .email("admin@bankresolve.com")
                .password(passwordEncoder.encode("Admin@1234"))
                .role(Role.ADMIN)
                .enabled(true)
                .bank(firstBank)
                .build();

        userRepository.save(admin);

        log.info("DataInitializer: seeded admin user → admin@bankresolve.com / Admin@1234");
    }
}
