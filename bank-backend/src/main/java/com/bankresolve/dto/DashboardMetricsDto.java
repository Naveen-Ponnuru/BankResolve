package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDto {
    private long totalGrievances;
    private long pending;
    private long resolved;
    private long highRisk;
    private Map<String, Long> categoryDistribution;
}
