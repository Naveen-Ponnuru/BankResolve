package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GrievanceSummaryDto {
    private long total;
    private long pending;
    private long resolved;
    private long highRisk;
}
