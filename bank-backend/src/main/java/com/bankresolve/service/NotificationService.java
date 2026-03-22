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
    private final com.bankresolve.repository.UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void notifyBankRole(Long bankId, com.bankresolve.entity.enums.Role role, String message, String type, Long relatedEntityId) {
        log.info("Broadcasting notification to bank ID: {}, role: {}", bankId, role);
        System.out.println("BankId: " + bankId + ", Role: " + role);
        List<User> users = userRepository.findByBankIdAndRole(bankId, role);
        System.out.println("Users found: " + users.size());
        for (User user : users) {
            notifyUser(user, message, type, relatedEntityId);
        }
    }

    @Transactional
    public void notifyUser(User user, String message, String type, Long relatedEntityId) {
        log.info("Notification: Notifying user {} with message: {}", user.getId(), message);
        
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Push real-time event via WebSocket
        String destination = "/topic/notifications/" + user.getId();
        System.out.println("Sending notification to user: " + user.getId() + " at destination: " + destination);
        messagingTemplate.convertAndSend(destination, saved);
        log.info("WebSocket: Sent notification to {}", destination);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
