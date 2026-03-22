package com.bankresolve.entity;

import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;


@Entity
@Table(name = "grievances", indexes = {
        @Index(name = "idx_grievance_status",   columnList = "status"),
        @Index(name = "idx_grievance_priority", columnList = "priority"),
        @Index(name = "idx_grievance_bank",     columnList = "bank_id"),
        @Index(name = "idx_grievance_customer", columnList = "customer_id"),
        @Index(name = "idx_grievance_staff",    columnList = "assigned_staff_id"),
        @Index(name = "idx_grievance_manager",  columnList = "assigned_manager_id")
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

    @Column(name = "reference_number", unique = true, nullable = false, length = 50)
    private String referenceNumber;

    @Column(name = "grievance_number", unique = true, length = 50)
    private String grievanceNumber;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "transaction_amount", precision = 19, scale = 2)
    private java.math.BigDecimal transactionAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private GrievanceStatus status = GrievanceStatus.FILED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    // ─── Relationships ────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id",
                foreignKey = @ForeignKey(name = "fk_grievance_customer"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id",
                foreignKey = @ForeignKey(name = "fk_grievance_staff"))
    private User assignedStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_manager_id",
                foreignKey = @ForeignKey(name = "fk_grievance_manager"))
    private User assignedManager;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_grievance_bank"))
    private Bank bank;

    // ─── Optional resolution fields (not in base schema) ─────────────────────
    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id",
                foreignKey = @ForeignKey(name = "fk_grievance_resolved_by"))
    private User resolvedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolved_role", length = 50)
    private com.bankresolve.entity.enums.Role resolvedRole;

    @Column(name = "target_sla")
    private Instant targetSla;

    @Column(name = "sla_deadline")
    private java.time.LocalDateTime slaDeadline;

    @Column(name = "feedback_rating")
    private Integer feedbackRating;

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    private String feedbackComment;

    @Column(name = "is_escalated", nullable = false)
    @Builder.Default
    private Boolean isEscalated = false;

    // ─── Workflow tracking fields ──────────────────────────────────────────────

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;
}
