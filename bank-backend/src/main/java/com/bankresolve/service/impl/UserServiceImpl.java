package com.bankresolve.service.impl;

import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<User> getAllUsers(String requesterEmail) {
        log.info("Listing all users.");
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id, String requesterEmail) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User createUser(User user, String requesterEmail) {
        User saved = userRepository.save(user);
        log.info("User {} created successfully.", saved.getEmail());
        return saved;
    }

    @Override
    public User updateUserStatus(Long id, boolean enabled, String requesterEmail) {
        User target = userRepository.findById(id).orElse(null);
        
        if (target != null) {
            target.setEnabled(enabled);
            User saved = userRepository.save(target);
            log.info("User {} status updated to {}.", target.getEmail(), enabled);
            return saved;
        }
        return null;
    }

    @Override
    public Map<String, Object> getUserStats(String requesterEmail) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeStaff", userRepository.countByRole(Role.STAFF));
        stats.put("systemHealth", "99.9%");
        stats.put("uptime", "30 days");
        return stats;
    }
}

