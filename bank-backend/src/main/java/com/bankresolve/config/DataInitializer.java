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
        seedInitialUsers();
    }

    // ─── Seed Banks ───────────────────────────────────────────────────────────

    private void seedBanks() {
        if (bankRepository.count() > 0) {
            log.info("DataInitializer: banks already seeded — skipping.");
            return;
        }

        Bank sbi = Bank.builder()
                .name("SBI")
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

        log.info("DataInitializer: seeded 3 banks (SBI001, HDFC001, ICICI001)");
    }

    // ─── Seed Admin User ──────────────────────────────────────────────────────

    private void seedInitialUsers() {
        if (userRepository.count() > 0) {
            log.info("DataInitializer: users already exist — skipping user seeding.");
            return;
        }

        // 1. Admin (associated with SBI)
        Bank sbi = bankRepository.findByCode("SBI001").orElseThrow();
        User admin = User.builder()
                .fullName("System Administrator")
                .email("admin@bankresolve.com")
                .password(passwordEncoder.encode("Admin@1234"))
                .role(Role.ADMIN)
                .enabled(true)
                .bank(sbi)
                .bankCode("SBI001")
                .build();
        userRepository.save(admin);

        // 2. SBI Staff
        User sbiStaff = User.builder()
                .fullName("SBI Staff")
                .email("sbi@bank.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.STAFF)
                .enabled(true)
                .bank(sbi)
                .bankCode("SBI001")
                .build();
        userRepository.save(sbiStaff);

        // 3. HDFC Staff
        Bank hdfc = bankRepository.findByCode("HDFC001").orElseThrow();
        User hdfcStaff = User.builder()
                .fullName("HDFC Staff")
                .email("hdfc@bank.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.STAFF)
                .enabled(true)
                .bank(hdfc)
                .bankCode("HDFC001")
                .build();
        userRepository.save(hdfcStaff);

        // 4. ICICI Staff
        Bank icici = bankRepository.findByCode("ICICI001").orElseThrow();
        User iciciStaff = User.builder()
                .fullName("ICICI Staff")
                .email("icici@bank.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.STAFF)
                .enabled(true)
                .bank(icici)
                .bankCode("ICICI001")
                .build();
        userRepository.save(iciciStaff);

        log.info("DataInitializer: seeded initial users (Admin + Staff for SBI, HDFC, ICICI)");
    }
}
