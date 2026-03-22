package com.bankresolve.dto;

import com.bankresolve.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
    /**
     * Backward-compatible JWT field used by existing frontend.
     */
    private String jwtToken;

    /**
     * Convenience alias to match `{ token, role, email }` response contract.
     * Mirrors {@link #jwtToken}.
     */
    private String token;

    /**
     * Top-level email and role for lightweight clients,
     * in addition to the nested {@link UserDto}.
     */
    private String email;
    private Role role;
    private Long bankId;
    private String bankName;

    private UserDto user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private Long bankId;
        private String bankName;
    }
}
