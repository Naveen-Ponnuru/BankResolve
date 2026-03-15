package com.bankresolve.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a persistent notification for a user.
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_notification_user"))
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "type", length = 50)
    private String type; // e.g., "GRIEVANCE_STATUS", "SLA_BREACH", "ASSIGNMENT"
}
