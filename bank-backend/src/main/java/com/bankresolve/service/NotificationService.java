package com.bankresolve.service;

import com.bankresolve.entity.Notification;
import com.bankresolve.entity.User;
import com.bankresolve.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SseService sseService;

    @Transactional
    public void notifyUser(User user, String message, String category, Long relatedEntityId) {
        log.info("Notification: Notifying user {} with message: {}", user.getId(), message);
        
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .category(category)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Push real-time event
        sseService.sendNotification(user.getId(), saved);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }
}
