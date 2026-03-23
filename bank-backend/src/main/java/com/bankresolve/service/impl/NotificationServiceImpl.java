package com.bankresolve.service.impl;

import com.bankresolve.dto.NotificationDto;
import com.bankresolve.entity.Notification;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.NotificationRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void notifyUser(User user, String message, String type, Long referenceId) {
        if (user == null) {
            log.warn("notifyUser called with null user — skipping notification: {}", message);
            return;
        }
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Phase 7: Push real-time over STOMP using the synced path structure
        String destination = "/topic/notifications/" + user.getId();
        log.info("WebSocket: Publishing to {} | Message: {}", destination, message);
        
        try {
            messagingTemplate.convertAndSend(destination, mapToDto(saved));
        } catch (Exception e) {
            log.error("WebSocket: Failed to publish notification to {}", destination, e);
        }
    }

    @Override
    @Transactional
    public void notifyBankRole(Long bankId, Role role, String message, String type, Long referenceId) {
        if (bankId == null || role == null) {
            log.warn("notifyBankRole called with null bankId={} or role={} — skipping.", bankId, role);
            return;
        }
        List<User> users = userRepository.findByBankIdAndRole(bankId, role);
        if (users.isEmpty()) {
            log.warn("notifyBankRole: No {} users found for bankId={}. Notification NOT delivered.", role, bankId);
            return;
        }
        log.info("notifyBankRole: Delivering '{}' to {} {} user(s) in bank {}", message, users.size(), role, bankId);
        for (User user : users) {
            notifyUser(user, message, type, referenceId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId, boolean unreadOnly) {
        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long id, Long userId) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        if (userId == null) {
            log.warn("markAllAsRead called with null userId — skipping.");
            return;
        }
        long unreadCount = notificationRepository.countByUserIdAndReadFalse(userId);
        if (unreadCount == 0) {
            log.debug("markAllAsRead: user {} has no unread notifications.", userId);
            return;
        }
        notificationRepository.markAllAsReadByUserId(userId);
        log.info("markAllAsRead: marked {} notifications as read for user {}", unreadCount, userId);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt() : Instant.now())
                .build();
    }
}
