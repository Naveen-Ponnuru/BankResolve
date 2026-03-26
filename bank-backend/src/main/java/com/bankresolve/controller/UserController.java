package com.bankresolve.controller;

import com.bankresolve.entity.User;
import com.bankresolve.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Admin endpoints for user management")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List users", description = "Admin only: returns scoped users depending on bank visibility")
    public ResponseEntity<List<User>> getAllUsers(java.security.Principal principal) {
        return ResponseEntity.ok(userService.getAllUsers(principal.getName()));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get user statistics", description = "Admin only: returns system-wide or bank-wide user metrics")
    public ResponseEntity<Map<String, Object>> getUserStats(java.security.Principal principal) {
        return ResponseEntity.ok(userService.getUserStats(principal.getName()));
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Admin only: creates a new staff or manager user")
    public ResponseEntity<User> createUser(@RequestBody User user, java.security.Principal principal) {
        return ResponseEntity.ok(userService.createUser(user, principal.getName()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user status", description = "Admin only: enables or disables a user account")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status, java.security.Principal principal) {
        return ResponseEntity.ok(userService.updateUserStatus(id, status.get("enabled"), principal.getName()));
    }
}
