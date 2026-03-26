package com.bankresolve.service.impl;

import com.bankresolve.dto.PublicFeedbackDto;
import com.bankresolve.dto.PublicStatsDto;
import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.PublicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicServiceImpl implements PublicService {

    private final UserRepository userRepository;
    private final GrievanceRepository grievanceRepository;

    @Override
    @Transactional(readOnly = true)
    public PublicStatsDto getPublicStats(Long bankId) {
        log.debug("[PublicStats] Fetching metrics for bankId: {}", bankId);
        
        // 1. Total users for this bank
        long totalUsers = userRepository.countByBankId(bankId);

        // 2. Total grievances resolved for this bank (Optimized Count)
        long grievancesResolved = grievanceRepository.countByBankIdAndStatus(bankId, GrievanceStatus.RESOLVED);

        log.info("[PublicStats] bankId: {}, users: {}, resolved: {}", bankId, totalUsers, grievancesResolved);

        // 3. Latest customer feedback (Already limited to Top 5 by repository)
        List<Grievance> ratedGrievances = grievanceRepository.findTop5ByBankIdAndFeedbackRatingIsNotNullOrderByResolvedAtDesc(bankId);
        
        List<PublicFeedbackDto> recentFeedback = ratedGrievances.stream()
                .map(this::mapToFeedbackDto)
                .collect(Collectors.toList());

        return PublicStatsDto.builder()
                .totalUsers(totalUsers)
                .grievancesResolved(grievancesResolved)
                .recentFeedback(recentFeedback)
                .build();
    }

    private PublicFeedbackDto mapToFeedbackDto(Grievance grievance) {
        // Return full customer name (No masking allowed as per Phase 15 requirements)
        String customerName = "A Customer";
        if (grievance.getCustomer() != null && grievance.getCustomer().getFullName() != null) {
            customerName = grievance.getCustomer().getFullName().trim();
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(ZoneId.systemDefault());
        
        // Use feedbackAt, fallback to resolvedAt, then empty string
        java.time.Instant dateToUse = grievance.getFeedbackAt() != null ? grievance.getFeedbackAt() : grievance.getResolvedAt();
        String timestamp = dateToUse != null ? formatter.format(dateToUse) : "";

        return PublicFeedbackDto.builder()
                .customerName(customerName)
                .rating(grievance.getFeedbackRating())
                .comment(grievance.getFeedbackComment())
                .timestamp(timestamp)
                .build();
    }
}
