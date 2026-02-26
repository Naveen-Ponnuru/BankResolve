package com.bankresolve.security;

import com.bankresolve.constants.ApplicationConstants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT service — generates, validates, and extracts claims from JWT tokens.
 * <p>
 * Claims included in every token:
 * <ul>
 *   <li>{@code userId}  — database primary key</li>
 *   <li>{@code email}   — user's login email</li>
 *   <li>{@code name}    — display name</li>
 *   <li>{@code roles}   — comma-separated authority list (e.g. "ROLE_CUSTOMER")</li>
 *   <li>{@code bankId}  — currently selected bank ID</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final Environment env;

    // ─── Token Generation ─────────────────────────────────────────────────────

    /**
     * Build a signed JWT with all bank-grievance claims.
     */
    public String generateToken(Long userId, String email, String name,
                                String roles, Long bankId) {
        return Jwts.builder()
                .issuer("BankResolve")
                .subject(email)
                .claim("userId", userId)
                .claim("email", email)
                .claim("name", name)
                .claim("roles", roles)
                .claim("bankId", bankId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()
                        + ApplicationConstants.JWT_EXPIRATION_MS))
                .signWith(getSigningKey())
                .compact();
    }

    // ─── Token Validation ─────────────────────────────────────────────────────

    /**
     * Returns {@code true} if the token is structurally valid and not expired.
     */
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns {@code true} if the token belongs to the given email.
     */
    public boolean isTokenValidForUser(String token, String email) {
        return extractEmail(token).equals(email) && !isTokenExpired(token);
    }

    // ─── Claim Extraction ─────────────────────────────────────────────────────

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public String extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", String.class));
    }

    public Long extractBankId(String token) {
        return extractClaim(token, claims -> claims.get("bankId", Long.class));
    }

    public String extractName(String token) {
        return extractClaim(token, claims -> claims.get("name", String.class));
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractClaim(token, Claims::getExpiration);
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = env.getProperty(ApplicationConstants.JWT_SECRET_KEY,
                ApplicationConstants.JWT_SECRET_DEFAULT);
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
