package com.bankresolve.dto;

import com.bankresolve.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    private String password;

    @Pattern(regexp = "^$|^\\d{10,15}$", message = "Mobile number must be 10-15 digits")
    private String mobileNumber;

    /**
     * Bank ID is role-dependent:
     *  - CUSTOMER: optional
     *  - STAFF/MANAGER: required (validated in service layer)
     *  - ADMIN: optional
     */
    private Long bankId;

    /**
     * Target system role for the new user.
     * Defaults to CUSTOMER in the service layer if omitted for backward compatibility.
     */
    private Role role;
}
