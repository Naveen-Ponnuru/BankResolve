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
        log.info("Running DB migrations: checking for legacy bank_code columns...");
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN bank_code");
            log.info("Successfully dropped legacy bank_code column from users table.");
        } catch (Exception e) {
            log.debug("users.bank_code column might not exist or already dropped.");
        }

        try {
            jdbcTemplate.execute("ALTER TABLE grievances DROP COLUMN bank_code");
            log.info("Successfully dropped legacy bank_code column from grievances table.");
        } catch (Exception e) {
            log.debug("grievances.bank_code column might not exist or already dropped.");
        }
    }
}
