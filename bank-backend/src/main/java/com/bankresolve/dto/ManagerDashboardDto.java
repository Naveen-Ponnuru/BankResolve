package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManagerDashboardDto {
    private long totalGrievances;
    private double avgResolutionTimeHours;
    private List<StaffWorkloadDto> staffWorkload;
}
