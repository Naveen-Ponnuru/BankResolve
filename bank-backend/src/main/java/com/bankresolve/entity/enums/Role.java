package com.bankresolve.entity.enums;

/**
 * User roles in the Bank Grievance Management System.
 * Stored as String in the database via @Enumerated(EnumType.STRING).
 */
public enum Role {
    CUSTOMER,
    STAFF,
    MANAGER,
    ADMIN
}
