package com.bankresolve.service;

import com.bankresolve.dto.GrievanceFeedbackDto;
import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.dto.GrievanceResponseDto;
import com.bankresolve.dto.GrievanceSummaryDto;
import com.bankresolve.dto.MonthlyTrendDto;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import java.util.List;

public interface GrievanceService {
    GrievanceResponseDto createGrievance(String customerEmail, GrievanceRequestDto request);
    List<GrievanceResponseDto> listGrievances(String email, GrievanceStatus status, Priority priority);
    GrievanceResponseDto getGrievanceById(Long id, String email);
    GrievanceResponseDto forwardToManager(Long id, String staffEmail);
    GrievanceResponseDto resolveGrievance(Long id, String userEmail);
    com.bankresolve.dto.GrievanceSummaryDto getDashboardSummary(String email);
    List<MonthlyTrendDto> getMonthlyTrend(String email);
    GrievanceResponseDto submitFeedback(Long id, GrievanceFeedbackDto feedback, String email);
}
