package com.bankresolve.entity;

import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

/**
 * Represents a customer grievance / complaint.
 *
 * <pre>
 * ┌─────────────────────────────────────────┐
 * │              Grievance                  │
 * ├─────────────────────────────────────────┤
 * │  id                : Long (PK)         │
 * │  bank_id           : Long (FK→Bank)    │
 * │  customer_id       : Long (FK→User)    │
 * │  assigned_staff_id : Long (FK→User)    │
 * │  title             : String            │
 * │  description       : String (TEXT)     │
 * │  status            : VARCHAR(50)       │
 * │  priority          : VARCHAR(50)       │
 * │  created_at        : Instant           │
 * └─────────────────────────────────────────┘
 * </pre>
 */
@Entity
@Table(name = "grievances", indexes = {
        @Index(name = "idx_grievance_status",   columnList = "status"),
        @Index(name = "idx_grievance_priority", columnList = "priority"),
        @Index(name = "idx_grievance_bank",     columnList = "bank_id"),
        @Index(name = "idx_grievance_customer", columnList = "customer_id"),
        @Index(name = "idx_grievance_staff",    columnList = "assigned_staff_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grievance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private GrievanceStatus status = GrievanceStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    // ─── Relationships ────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_grievance_customer"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id",
                foreignKey = @ForeignKey(name = "fk_grievance_staff"))
    private User assignedStaff;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_grievance_bank"))
    private Bank bank;

    // ─── Optional resolution fields (not in base schema) ─────────────────────
    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "target_sla")
    private Instant targetSla;
}
