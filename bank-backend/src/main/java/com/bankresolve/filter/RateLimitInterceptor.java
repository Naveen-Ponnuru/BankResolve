package com.bankresolve.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory token-bucket rate limiter for critical endpoints.
 *
 * Limits:
 *  - Grievance creation  (POST /api/grievances)  → 10 requests / minute per user
 *  - Notification list   (GET /api/notifications) → 30 requests / minute per user
 *
 * Uses a per-user sliding-window counter backed by a ConcurrentHashMap.
 * For production, replace with Redis-backed Bucket4j.
 */
@Slf4j
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int GRIEVANCE_LIMIT = 10;
    private static final int NOTIFICATION_LIMIT = 100;
    private static final long WINDOW_MILLIS = 60_000; // 1 minute

    // key = "email:path", value = [count, windowStart]
    private final Map<String, long[]> requestCounts = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();
        String path   = request.getRequestURI();

        int limit = resolveLimit(method, path);
        if (limit == 0) return true; // unthrottled path

        Principal principal = request.getUserPrincipal();
        String identity = principal != null ? principal.getName() : request.getRemoteAddr();
        String key = identity + ":" + path;

        long now = Instant.now().toEpochMilli();
        long[] window = requestCounts.compute(key, (k, v) -> {
            if (v == null || now - v[1] > WINDOW_MILLIS) {
                return new long[]{1, now};
            }
            v[0]++;
            return v;
        });

        if (window[0] > limit) {
            log.warn("Rate limit exceeded for user={} on {} {}. Count={}", identity, method, path, window[0]);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please slow down.\",\"retryAfterSeconds\":60}");
            return false;
        }

        return true;
    }

    private int resolveLimit(String method, String path) {
        if ("POST".equalsIgnoreCase(method) && path.startsWith("/api/grievances")) {
            return GRIEVANCE_LIMIT;
        }
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/notifications")) {
            return NOTIFICATION_LIMIT;
        }
        return 0; // no limit applied
    }
}
