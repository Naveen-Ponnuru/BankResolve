package com.bankresolve.service;

import com.bankresolve.dto.GrievanceFeedbackDto;
import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.dto.GrievanceResponseDto;
import com.bankresolve.dto.GrievanceSummaryDto;
import com.bankresolve.dto.MonthlyTrendDto;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface GrievanceService {
    GrievanceResponseDto createGrievance(String customerEmail, GrievanceRequestDto request);
    List<GrievanceResponseDto> listGrievances(String email, GrievanceStatus status, Priority priority);
    Page<GrievanceResponseDto> listGrievancesPaged(String email, GrievanceStatus status, Priority priority, Pageable pageable);
    GrievanceResponseDto getGrievanceById(Long id, String email);
    GrievanceResponseDto forwardToManager(Long id, String staffEmail);
    GrievanceResponseDto resolveGrievance(Long id, String userEmail);
    com.bankresolve.dto.GrievanceSummaryDto getDashboardSummary(String email);
    List<MonthlyTrendDto> getMonthlyTrend(String email);
    GrievanceResponseDto updateStatus(Long id, GrievanceStatus newStatus, String userEmail);
    GrievanceResponseDto submitFeedback(Long id, GrievanceFeedbackDto feedback, String email);
    List<GrievanceResponseDto> getRecentFeedback(String email);
    List<com.bankresolve.dto.GrievanceHistoryDto> getGrievanceHistory(Long id, String email);
    GrievanceResponseDto withdrawGrievance(Long id, String customerEmail);
}
