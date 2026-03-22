package com.bankresolve.scheduler;

import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlaMonitorService {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Run every hour to check for breached SLAs.
     * Transitions FILED or IN_PROGRESS grievances to ESCALATED if the targetSla is in the past.
     */
    @Scheduled(cron = "0 0 * * * *") // Runs at the top of every hour
    @Transactional
    public void sweepBreachedGrievances() {
        log.info("SLA Monitor: Starting sweep for breached grievances...");
        
        // All non-terminal statuses that can breach SLA
        List<GrievanceStatus> activeStatuses = List.of(
                GrievanceStatus.FILED,
                GrievanceStatus.PENDING,
                GrievanceStatus.ACCEPTED,
                GrievanceStatus.IN_PROGRESS
        );
        
        // Find all active grievances where the slaDeadline is before now and not already escalated
        List<Grievance> breachedGrievances = grievanceRepository.findByStatusInAndSlaDeadlineBeforeAndIsEscalatedFalse(
                activeStatuses, java.time.LocalDateTime.now()
        );

        if (breachedGrievances.isEmpty()) {
            log.info("SLA Monitor: No new breached grievances found.");
            return;
        }

        log.warn("SLA Monitor: Found {} breached grievances. Auto-escalating...", breachedGrievances.size());

        for (Grievance grievance : breachedGrievances) {
            grievance.setStatus(GrievanceStatus.ESCALATED);
            grievance.setIsEscalated(true);
            
            // Assign to Manager
            List<User> managers = userRepository.findByBankIdAndRole(grievance.getBank().getId(), Role.MANAGER);
            if (!managers.isEmpty()) {
                grievance.setAssignedManager(managers.get(0));
            }

            // Build the customer-facing grievance identifier
            String grvNum = grievance.getGrievanceNumber() != null
                    ? grievance.getGrievanceNumber()
                    : grievance.getReferenceNumber();

            // Notify Customer — WebSocket → /topic/notifications/{customerId}
            notificationService.notifyUser(grievance.getCustomer(),
                    "Your complaint " + grvNum + " has been escalated due to SLA breach. A manager will handle it.",
                    "SLA_BREACH", grievance.getId());

            // Notify Staff if assigned — WebSocket → /topic/notifications/{staffId}
            if (grievance.getAssignedStaff() != null) {
                notificationService.notifyUser(grievance.getAssignedStaff(),
                        "URGENT: Complaint " + grvNum + " has breached SLA and been escalated to Manager.",
                        "SLA_BREACH", grievance.getId());
            }

            // Notify Bank Managers — WebSocket → /topic/notifications/{managerId}
            List<User> bankManagers = userRepository.findByBankIdAndRole(grievance.getBank().getId(), Role.MANAGER);
            for (User manager : bankManagers) {
                notificationService.notifyUser(manager,
                        "SLA ALERT: Complaint " + grvNum + " has been escalated to you. Please action immediately.",
                        "SLA_BREACH", grievance.getId());
            }
        }

        grievanceRepository.saveAll(breachedGrievances);
        log.info("SLA Monitor: Successfully escalated {} grievances.", breachedGrievances.size());
        
        // TODO: In Phase 2, trigger SSE Notifications here.
    }
}
