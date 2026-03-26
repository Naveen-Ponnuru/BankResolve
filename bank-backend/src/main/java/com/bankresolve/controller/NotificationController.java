package com.bankresolve.controller;

import com.bankresolve.dto.NotificationDto;
import com.bankresolve.entity.User;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "Endpoints for managing real-time user notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user notifications", description = "Fetches all notifications for the authenticated user, sorted by newest first.")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            Principal principal,
            @RequestParam(defaultValue = "false", required = false) boolean unreadOnly) {
        User user = getUser(principal);
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId(), unreadOnly));
    }

    @GetMapping("/paged")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user notifications (Paginated)", 
               description = "Returns a paginated list of notifications for the authenticated user.")
    public ResponseEntity<Page<NotificationDto>> getNotificationsPaged(
            Principal principal,
            @RequestParam(defaultValue = "false", required = false) boolean unreadOnly,
            Pageable pageable) {
        User user = getUser(principal);
        return ResponseEntity.ok(notificationService.getUserNotificationsPaged(user.getId(), unreadOnly, pageable));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Returns the count of unread notifications for the user.")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark single notification as read", description = "Marks a specific notification as read.")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Principal principal) {
        User user = getUser(principal);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read", description = "Marks all unread notifications for the user as read.")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        User user = getUser(principal);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
    
    private User getUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getName()));
    }
}
