package com.bankresolve.constants;

/**
 * Application-wide constants for JWT configuration, grievance statuses,
 * priority levels, and role names.
 */
public final class ApplicationConstants {

    private ApplicationConstants() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    // ─── JWT ──────────────────────────────────────────────────────────────────
    public static final String JWT_SECRET_KEY      = "JWT_SECRET";
    public static final String JWT_SECRET_DEFAULT   = "BankResolveSecretKeyForJWTSigning2026!";
    public static final String JWT_HEADER           = "Authorization";
    public static final long   JWT_EXPIRATION_MS    = 24 * 60 * 60 * 1000L; // 24 hours

    // ─── Grievance Status ─────────────────────────────────────────────────────
    public static final String STATUS_OPEN          = "OPEN";
    public static final String STATUS_IN_PROGRESS   = "IN_PROGRESS";
    public static final String STATUS_ESCALATED     = "ESCALATED";
    public static final String STATUS_RESOLVED      = "RESOLVED";
    public static final String STATUS_CLOSED        = "CLOSED";

    // ─── Priority ─────────────────────────────────────────────────────────────
    public static final String PRIORITY_LOW         = "LOW";
    public static final String PRIORITY_MEDIUM      = "MEDIUM";
    public static final String PRIORITY_HIGH        = "HIGH";
    public static final String PRIORITY_CRITICAL    = "CRITICAL";

    // ─── Roles ────────────────────────────────────────────────────────────────
    public static final String ROLE_CUSTOMER        = "ROLE_CUSTOMER";
    public static final String ROLE_STAFF           = "ROLE_STAFF";
    public static final String ROLE_MANAGER         = "ROLE_MANAGER";
    public static final String ROLE_ADMIN           = "ROLE_ADMIN";
}
