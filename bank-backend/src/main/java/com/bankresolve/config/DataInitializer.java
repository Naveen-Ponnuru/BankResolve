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
    private final com.bankresolve.repository.BankFeatureRepository bankFeatureRepository;

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

        Bank hdfc = Bank.builder().name("HDFC Bank").code("HDFC001").themeColor("indigo").tagline("SmartBanking at your fingertips.").build();
        Bank icici = Bank.builder().name("ICICI Bank").code("ICICI001").themeColor("orange").tagline("iMobile Pay: One-stop banking solution.").build();
        Bank sbi = Bank.builder().name("SBI Bank").code("SBI001").themeColor("blue").tagline("Fast, transparent, and secure resolution.").build();
        Bank axis = Bank.builder().name("Axis Bank").code("AXIS001").themeColor("blue").tagline("Experience the future of banking.").build();

        bankRepository.save(hdfc);
        bankRepository.save(icici);
        bankRepository.save(sbi);
        bankRepository.save(axis);

        // Seed Features for SBI
        seedFeature("24/7 Digital Banking", "Access your accounts anytime, anywhere with YONO SBI.", "faClock", sbi);
        seedFeature("Quick Grievance Resolution", "Dedicated nodal officers for swift complaint handling.", "faHeadset", sbi);
        seedFeature("Widespread Network", "Largest ATM and branch network across the country.", "faShieldAlt", sbi);

        // Seed Features for HDFC
        seedFeature("SmartBanking", "Experience seamless banking with our award-winning mobile app.", "faMobileAlt", hdfc);
        seedFeature("Priority Support", "Express grievance routing and handling for premium customers.", "faHeadset", hdfc);
        seedFeature("Secure Transactions", "Industry-leading security for your peace of mind.", "faShieldAlt", hdfc);

        // Seed Features for ICICI
        seedFeature("iMobile Pay", "One-stop solution for all your banking and payment needs.", "faMobileAlt", icici);
        seedFeature("Transparent Tracking", "Real-time updates on your grievance resolution status.", "faChartLine", icici);
        seedFeature("Wealth Management", "Integrated services for your complete financial portfolio.", "faWallet", icici);

        log.info("DataInitializer: seeded banks and features");
    }

    private void seedFeature(String title, String desc, String icon, Bank bank) {
        com.bankresolve.entity.BankFeature feature = com.bankresolve.entity.BankFeature.builder()
                .title(title)
                .description(desc)
                .iconName(icon)
                .bank(bank)
                .build();
        bankFeatureRepository.save(feature);
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
