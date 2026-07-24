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
    public PublicStatsDto getPublicStats() {
        log.debug("[PublicStats] Fetching metrics");
        
        long totalUsers = userRepository.count();
        long grievancesResolved = grievanceRepository.countByStatus(GrievanceStatus.RESOLVED);

        log.info("[PublicStats] users: {}, resolved: {}", totalUsers, grievancesResolved);

        List<Grievance> ratedGrievances = grievanceRepository.findRecentFeedbackGlobal().stream()
                .limit(5)
                .collect(Collectors.toList());
        
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
        String customerName = "A Customer";
        if (grievance.getCustomer() != null && grievance.getCustomer().getFullName() != null) {
            customerName = grievance.getCustomer().getFullName().trim();
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(ZoneId.systemDefault());
        
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

