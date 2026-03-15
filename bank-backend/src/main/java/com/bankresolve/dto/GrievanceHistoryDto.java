package com.bankresolve.dto;

import com.bankresolve.entity.enums.GrievanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GrievanceHistoryDto {
    private Long id;
    private Long grievanceId;
    private GrievanceStatus status;
    private String updatedBy;
    private Instant timestamp;
    private String note;
}
