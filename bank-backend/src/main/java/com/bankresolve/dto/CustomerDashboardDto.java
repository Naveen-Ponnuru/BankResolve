package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDashboardDto {
    private long totalGrievances;
    private long openGrievances;
    private long resolvedGrievances;
}
