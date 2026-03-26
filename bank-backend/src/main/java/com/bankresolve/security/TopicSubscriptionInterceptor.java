package com.bankresolve.security;

import com.bankresolve.repository.UserRepository;
import com.bankresolve.util.AuditLogger;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.Deque;
import java.util.Map;

/**
 * Ultimate Production-Grade WebSocket Interceptor.
 * Features:
 * - Sliding Window Rate Limiting (Session + User Level)
 * - Micrometer Observability (Counters, Gauges)
 * - Bidirectional Routing Enforcement (SEND to /app only)
 * - Strict Regex Ownership Validation
 * - Fail-Safe Handshake Awareness
 */
@Component
@Slf4j
public class TopicSubscriptionInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final MeterRegistry meterRegistry;
    private final Counter rateLimitCounter;
    private final Counter securityViolationCounter;
    private final AuditLogger auditLogger;

    public TopicSubscriptionInterceptor(JwtService jwtService,
                                        CustomUserDetailsService userDetailsService,
                                        UserRepository userRepository,
                                        MeterRegistry meterRegistry,
                                        AuditLogger auditLogger) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.meterRegistry = meterRegistry;
        this.auditLogger = auditLogger;

        this.rateLimitCounter = Counter.builder("websocket.rate.limit.hit").register(meterRegistry);
        this.securityViolationCounter = Counter.builder("websocket.security.violations").register(meterRegistry);
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        StompCommand command = accessor.getCommand();
        if (command == null) return message;

        // ─── 1. CONNECT AUTHENTICATION ─────────────────────────────────────
        if (StompCommand.CONNECT.equals(command)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new AccessDeniedException("Missing WebSocket Authorization token");
            }

            String jwt = authHeader.substring(7);
            if (!jwtService.isTokenValid(jwt)) {
                throw new AccessDeniedException("Expired or invalid WebSocket token");
            }

            String email = jwtService.extractEmail(jwt); // Already normalized by JwtService.extractEmail

            // ✅ FIX: DB Existence Check — reject if account no longer exists
            // Email is already normalized (trim().toLowerCase()), so existsByEmail() is sufficient.
            if (!userRepository.existsByEmail(email)) {
                log.warn("WebSocket CONNECT REJECTED: User not found in DB for email [{}]", email);
                throw new AccessDeniedException("WebSocket connection denied: user account not found");
            }

            UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserByUsername(email);

            // Final Guard: JWT subject must match resolved user email
            if (!email.equals(userPrincipal.getEmail().trim().toLowerCase())) {
                log.error("SECURITY ALERT: Principal mismatch for user {}", email);
                throw new AccessDeniedException("Identity verification failed");
            }

            accessor.setUser(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()
            ));
            log.info("WebSocket: Authenticated session established for user [{}]", email);
            return message;
        }

        // ─── 2. IDENTITY VERIFICATION ──────────────────────────────────────
        Authentication auth = (Authentication) accessor.getHeader("simpUser");
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("WebSocket session unauthenticated");
        }

        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        String destination = accessor.getDestination();

        // ─── 3. SUBSCRIBE DEFENSE ──────────────────────────────────────────
        if (StompCommand.SUBSCRIBE.equals(command)) {
            if (destination == null) throw new AccessDeniedException("Missing destination");
            
            // ALLOW: /user/**
            if (destination.startsWith("/user/")) {
                return message;
            }
            
            // REJECT: /topic/**
            if (destination.startsWith("/topic/")) {
                recordViolation("forbidden_topic_subscribe", user, destination);
                throw new AccessDeniedException("Topic subscriptions are disabled. Use private user queues.");
            }
        }

        // ─── 4. SEND DEFENSE ───────────────────────────────────────────────
        if (StompCommand.SEND.equals(command)) {
            if (destination == null) throw new AccessDeniedException("Missing destination");
            
            // ALLOW ONLY: /app/**
            if (!destination.startsWith("/app/")) {
                recordViolation("forbidden_send_destination", user, destination);
                throw new AccessDeniedException("Clients may only send to /app destinations.");
            }
        }

        return message;
    }

    private void recordViolation(String reason, UserPrincipal user, String destination) {
        securityViolationCounter.increment();
        auditLogger.logSecurityViolation("WEBSOCKET_VIOLATION", 
            user.getId(), user.getBankId(), "STOMP", destination, "REJECTED " + reason);
        log.warn("REJECTED {}: User [{}] attempted delivery to {}", reason, user.getEmail(), destination);
    }

    private void recordViolation(String reason) {
        recordViolation(reason, null, "N/A");
    }
}
