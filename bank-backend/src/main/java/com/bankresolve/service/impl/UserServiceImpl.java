package com.bankresolve.service.impl;

import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.UserService;
import com.bankresolve.security.BankContextUtil;
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
    private final BankRepository bankRepository;
    private final BankContextUtil bankContextUtil;

    @Override
    public List<User> getAllUsers(String requesterEmail) {
        User requester = bankContextUtil.getCurrentUser();
        Role role = requester.getRole();
        
        if (role == Role.ADMIN) {
            log.info("Super-Admin listing all users.");
            return userRepository.findAll();
        } else {
            Long bankId = bankContextUtil.getCurrentBankId();
            log.info("Manager listing users for bankId {}.", bankId);
            return userRepository.findByBankId(bankId);
        }
    }

    @Override
    public User getUserById(Long id, String requesterEmail) {
        User requester = bankContextUtil.getCurrentUser();
        User target = userRepository.findById(id).orElse(null);
        
        if (target != null && requester.getRole() != Role.ADMIN) {
            bankContextUtil.validateBankAccess(target.getBank() != null ? target.getBank().getId() : null);
        }
        return target;
    }

    @Override
    public User createUser(User user, String requesterEmail) {
        User requester = bankContextUtil.getCurrentUser();
        Role role = requester.getRole();
        
        if (role != Role.ADMIN) {
            Long bankId = bankContextUtil.getCurrentBankId();
            if (user.getBank() == null || !user.getBank().getId().equals(bankId)) {
                log.warn("Security Audit Alert: User tried to create a user for a different bank.");
                throw new org.springframework.security.access.AccessDeniedException("Access Denied: Cannot create users outside your bank.");
            }
        }
        
        User saved = userRepository.save(user);
        log.info("User {} created successfully.", saved.getEmail());
        return saved;
    }

    @Override
    public User updateUserStatus(Long id, boolean enabled, String requesterEmail) {
        User requester = bankContextUtil.getCurrentUser();
        User target = userRepository.findById(id).orElse(null);
        
        if (target != null) {
            if (requester.getRole() != Role.ADMIN) {
                bankContextUtil.validateBankAccess(target.getBank() != null ? target.getBank().getId() : null);
            }
            target.setEnabled(enabled);
            User saved = userRepository.save(target);
            log.info("User {} status updated to {}.", target.getEmail(), enabled);
            return saved;
        }
        return null;
    }

    @Override
    public Map<String, Object> getUserStats(String requesterEmail) {
        User requester = bankContextUtil.getCurrentUser();
        Role role = requester.getRole();
        Map<String, Object> stats = new HashMap<>();
        
        if (role == Role.ADMIN) {
            stats.put("totalUsers", userRepository.count());
            stats.put("activeStaff", userRepository.countByRole(Role.STAFF));
            stats.put("activeBanks", bankRepository.count());
        } else {
            Long bankId = bankContextUtil.getCurrentBankId();
            stats.put("totalUsers", userRepository.countByBankId(bankId));
            stats.put("activeStaff", userRepository.findByBankIdAndRole(bankId, Role.STAFF).stream().filter(User::getEnabled).count());
            stats.put("activeBanks", 1);
        }
        
        stats.put("systemHealth", "99.9%");
        stats.put("uptime", "30 days");
        return stats;
    }
    
}
