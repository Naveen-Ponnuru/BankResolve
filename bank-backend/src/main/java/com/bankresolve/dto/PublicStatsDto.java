package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicStatsDto {
    private long totalUsers;
    private long grievancesResolved;
    private List<PublicFeedbackDto> recentFeedback;
}
