package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StaffDashboardDto {
    private long assignedGrievances;
    private long pendingGrievances;
    private long slaBreaches;
}
