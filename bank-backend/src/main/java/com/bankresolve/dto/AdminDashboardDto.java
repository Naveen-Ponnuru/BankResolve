package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private DashboardMetricsDto metrics;
    private List<Map<String, Object>> monthlyTrends;
    private long totalBanks;
    private long totalActiveUsers;
}
