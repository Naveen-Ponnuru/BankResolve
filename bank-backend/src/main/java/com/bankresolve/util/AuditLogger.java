package com.bankresolve.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Enterprise Security Audit Logger.
 * Produces structured key=value logs for easy ingestion by ELK/Splunk/CloudWatch.
 */
@Slf4j
@Component
public class AuditLogger {

    public void logSecurityViolation(String type, Long userId, Long bankId, String method, String endpoint, String message) {
        log.warn("SECURITY_ALERT type={} userId={} bankId={} method={} endpoint={} message=\"{}\"",
                type, 
                userId != null ? userId : "anonymous",
                bankId != null ? bankId : "none",
                method != null ? method : "N/A",
                endpoint != null ? endpoint : "N/A",
                message);
    }
}
