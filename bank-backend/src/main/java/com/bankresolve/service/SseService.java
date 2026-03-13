package com.bankresolve.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SseService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // Infinite timeout for demo purposes
        
        emitter.onCompletion(() -> {
            log.info("SSE: Emitter completed for user {}", userId);
            emitters.remove(userId);
        });
        emitter.onTimeout(() -> {
            log.info("SSE: Emitter timeout for user {}", userId);
            emitters.remove(userId);
        });
        emitter.onError((e) -> {
            log.error("SSE: Emitter error for user {}: {}", userId, e.getMessage());
            emitters.remove(userId);
        });

        emitters.put(userId, emitter);
        log.info("SSE: User {} subscribed. Active count: {}", userId, emitters.size());
        
        // Send initial heartbeat logic could go here
        return emitter;
    }

    public void sendNotification(Long userId, Object notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
                log.info("SSE: Sent notification to user {}", userId);
            } catch (IOException e) {
                log.error("SSE: Error sending to user {}: {}", userId, e.getMessage());
                emitters.remove(userId);
            }
        } else {
            log.debug("SSE: User {} not connected, skipping live emit", userId);
        }
    }
}
