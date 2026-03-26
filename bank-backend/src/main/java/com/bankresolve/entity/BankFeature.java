package com.bankresolve.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "bank_features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankFeature extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Feature title is required")
    private String title;

    @NotBlank(message = "Feature description is required")
    @Column(length = 500)
    private String description;

    private String iconName; // FontAwesome icon identifier

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;
}
