package com.bankresolve.repository;

import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    List<User> findByRole(Role role);

    // MANAGER ONLY - must be used with role check
    long countByRole(Role role);

    // MANAGER ONLY - must be used with role check
    long countByEnabledTrue();


}
