package com.bankresolve.entity;

import com.bankresolve.entity.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Represents a user in the system (Customer, Staff, Manager, or Admin).
 *
 * <pre>
 * ┌──────────────────────────────────┐
 * │              User                │
 * ├──────────────────────────────────┤
 * │  id           : Long (PK)       │
 * │  bank_id      : Long (FK→Bank)  │
 * │  role_id      : Long (FK→roles) │  (not used by JPA — managed via role enum)
 * │  full_name    : String          │
 * │  email        : String (UQ)     │
 * │  password     : String (hash)   │
 * │  phone        : String          │
 * │  role         : Role (VARCHAR)  │
 * │  enabled      : Boolean         │
 * │  created_at   : Instant         │
 * └──────────────────────────────────┘
 *
 *  Relationships:
 *    User ──ManyToOne──▶ Bank
 * </pre>
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    @Size(max = 150)
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false, length = 255)
    private String password;

    @Size(max = 20)
    @Column(name = "phone", unique = true, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "bank_code", length = 50)
    private String bankCode;

    // ─── Relationships ────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_bank"))
    private Bank bank;
}
