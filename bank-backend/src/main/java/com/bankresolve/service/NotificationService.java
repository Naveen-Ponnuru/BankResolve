package com.bankresolve.service;

import com.bankresolve.dto.NotificationDto;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    void notifyUser(User user, String message, String type, Long referenceId);

    void notifyBankRole(Long bankId, Role role, String message, String type, Long referenceId);

    List<NotificationDto> getUserNotifications(Long userId, boolean unreadOnly);

    Page<NotificationDto> getUserNotificationsPaged(Long userId, boolean unreadOnly, Pageable pageable);

    long getUnreadCount(Long userId);

    void markAsRead(Long id, Long userId);

    void markAllAsRead(Long userId);
}
