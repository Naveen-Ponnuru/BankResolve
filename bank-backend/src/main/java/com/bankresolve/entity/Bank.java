package com.bankresolve.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Represents a bank registered in the system.
 * A bank can have many users and many grievances.
 *
 * <pre>
 * ┌──────────────────────────────┐
 * │            Bank              │
 * ├──────────────────────────────┤
 * │  id          : Long (PK)    │
 * │  name        : String       │
 * │  code        : String (UQ)  │
 * │  created_at  : Instant      │
 * └──────────────────────────────┘
 * </pre>
 */
@Entity
@Table(name = "banks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Bank name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Bank code is required")
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String code;
}
