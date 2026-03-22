package com.bankresolve.dto;

import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GrievanceResponseDto {
    private Long id;
    private String referenceNumber;
    private String grievanceNumber;
    private String title;
    private String description;
    private String category;
    private BigDecimal transactionAmount;
    private String bankCode;
    private GrievanceStatus status;
    private Priority priority;
    private Long customerId;
    private String customerName;
    private Long assignedStaffId;
    private String assignedStaffName;
    private Long assignedManagerId;
    private String assignedManagerName;
    private Instant createdAt;
    private Instant resolvedAt;
    private Long resolvedById;
    private String resolvedByName;
    private com.bankresolve.entity.enums.Role resolvedRole;
    private Integer feedbackRating;
    private String feedbackComment;
    private Instant targetSla;
    private Boolean isEscalated;
    private Instant updatedAt;
    private String updatedBy;
    private String assignedTo;
}
