package com.bankresolve.entity.enums;

/**
 * Grievance lifecycle statuses.
 * Workflow: FILED → PENDING → ACCEPTED → IN_PROGRESS → RESOLVED
 */
public enum GrievanceStatus {
    FILED,
    PENDING,
    ACCEPTED,
    IN_PROGRESS,
    ESCALATED,
    RESOLVED,
    REJECTED,
    WITHDRAWN
}
