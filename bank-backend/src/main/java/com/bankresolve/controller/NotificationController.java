package com.bankresolve.controller;

import com.bankresolve.entity.Notification;
import com.bankresolve.entity.User;
import com.bankresolve.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final com.bankresolve.repository.UserRepository userRepository;

    /**
     * Get all notifications for the current user. (Phase 3)
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getCurrentUserNotifications(java.security.Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    /**
     * Get unread count for current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(java.security.Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    /**
     * Get all notifications for a specific user (Internal/Debug).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    /**
     * Mark a notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Mark all notifications as read for current user.
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(java.security.Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
