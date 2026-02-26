package com.bankresolve.service.impl;

import com.bankresolve.dto.AdminDashboardDto;
import com.bankresolve.dto.CustomerDashboardDto;
import com.bankresolve.dto.ManagerDashboardDto;
import com.bankresolve.dto.StaffDashboardDto;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;

    // ─── Customer ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public CustomerDashboardDto getCustomerDashboard(String email) {
        User user = getUserByEmail(email);

        long total    = grievanceRepository.countByCustomerId(user.getId());
        long open     = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.OPEN);
        long resolved = grievanceRepository.countByCustomerIdAndStatus(user.getId(), GrievanceStatus.RESOLVED);

        return CustomerDashboardDto.builder()
                .totalGrievances(total)
                .openGrievances(open)
                .resolvedGrievances(resolved)
                .build();
    }

    // ─── Staff ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public StaffDashboardDto getStaffDashboard(String email) {
        User user = getUserByEmail(email);

        long assigned   = grievanceRepository.countByAssignedStaffId(user.getId());
        long pending    = grievanceRepository.countByStaffAndStatuses(user.getId(),
                              List.of(GrievanceStatus.OPEN, GrievanceStatus.IN_PROGRESS));
        long slaBreaches = grievanceRepository.countSlaBreachesByStaffId(user.getId());

        return StaffDashboardDto.builder()
                .assignedGrievances(assigned)
                .pendingGrievances(pending)
                .slaBreaches(slaBreaches)
                .build();
    }

    // ─── Manager ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ManagerDashboardDto getManagerDashboard(String email) {
        User user   = getUserByEmail(email);
        Long bankId = user.getBank() != null ? user.getBank().getId() : null;

        if (bankId == null) {
            throw new IllegalStateException("Manager has no bank assigned");
        }

        long total      = grievanceRepository.countByBankId(bankId);
        Double avgTime  = grievanceRepository.getAverageResolutionTimeByBankId(bankId);
        var workload    = grievanceRepository.getStaffWorkloadByBankId(bankId);

        return ManagerDashboardDto.builder()
                .totalGrievances(total)
                .avgResolutionTimeHours(avgTime != null ? avgTime : 0.0)
                .staffWorkload(workload)
                .build();
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        return AdminDashboardDto.builder()
                .totalBanks(bankRepository.count())
                .totalUsers(userRepository.count())
                .totalGrievances(grievanceRepository.count())
                .build();
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
