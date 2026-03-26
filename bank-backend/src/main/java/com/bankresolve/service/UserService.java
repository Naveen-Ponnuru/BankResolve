package com.bankresolve.service;

import com.bankresolve.entity.User;
import java.util.List;
import java.util.Map;

public interface UserService {
    List<User> getAllUsers(String requesterEmail);
    User getUserById(Long id, String requesterEmail);
    User createUser(User user, String requesterEmail);
    User updateUserStatus(Long id, boolean enabled, String requesterEmail);
    Map<String, Object> getUserStats(String requesterEmail);
}
