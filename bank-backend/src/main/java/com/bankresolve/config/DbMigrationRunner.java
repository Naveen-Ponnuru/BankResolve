package com.bankresolve.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DbMigrationRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public DbMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Running DB migrations: cleaning up multi-bank schema elements...");
        
        // 1. Drop foreign keys and columns from grievances
        try {
            jdbcTemplate.execute("ALTER TABLE grievances DROP FOREIGN KEY fk_grievance_bank");
            log.info("Dropped fk_grievance_bank constraint.");
        } catch (Exception e) {
            log.debug("fk_grievance_bank might not exist or already dropped.");
        }
        try {
            jdbcTemplate.execute("ALTER TABLE grievances DROP COLUMN bank_id");
            log.info("Dropped bank_id column from grievances.");
        } catch (Exception e) {
            log.debug("grievances.bank_id might not exist or already dropped.");
        }

        // 2. Drop foreign keys and columns from users
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP FOREIGN KEY fk_user_bank");
            log.info("Dropped fk_user_bank constraint.");
        } catch (Exception e) {
            log.debug("fk_user_bank might not exist or already dropped.");
        }
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN bank_id");
            log.info("Dropped bank_id column from users.");
        } catch (Exception e) {
            log.debug("users.bank_id might not exist or already dropped.");
        }

        // 3. Drop bank relation from contacts (Hibernate defaults constraints by mapping)
        try {
            // Find contact bank constraint name dynamically and drop it
            jdbcTemplate.execute("ALTER TABLE contacts DROP FOREIGN KEY FKig9wh021577t9f13v8aoujoxl"); 
        } catch (Exception e) {
            // Try drop column directly
        }
        try {
            jdbcTemplate.execute("ALTER TABLE contacts DROP COLUMN bank_id");
            log.info("Dropped bank_id column from contacts.");
        } catch (Exception e) {
            log.debug("contacts.bank_id might not exist or already dropped.");
        }

        // 4. Drop bank_features and banks tables
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS bank_features");
            log.info("Dropped bank_features table.");
        } catch (Exception e) {
            log.debug("bank_features table drop failed.");
        }
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS banks");
            log.info("Dropped banks table.");
        } catch (Exception e) {
            log.debug("banks table drop failed.");
        }
    }
}
