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
        
        List<GrievanceStatus> activeStatuses = List.of(GrievanceStatus.FILED, GrievanceStatus.PENDING);
        
        // Find all active grievances where the targetSla is before now and not already escalated
        List<Grievance> breachedGrievances = grievanceRepository.findByStatusInAndTargetSlaBeforeAndIsEscalatedFalse(
                activeStatuses, Instant.now()
        );

        if (breachedGrievances.isEmpty()) {
            log.info("SLA Monitor: No new breached grievances found.");
            return;
        }

        log.warn("SLA Monitor: Found {} breached grievances. Auto-escalating...", breachedGrievances.size());

        for (Grievance grievance : breachedGrievances) {
            grievance.setStatus(GrievanceStatus.ESCALATED);
            grievance.setIsEscalated(true);
            
            // Notify Customer
            notificationService.notifyUser(grievance.getCustomer(), 
                    "Your grievance " + grievance.getReferenceNumber() + " has been escalated due to SLA breach.",
                    "SLA_BREACH", grievance.getId());

            // Notify Staff if assigned
            if (grievance.getAssignedStaff() != null) {
                notificationService.notifyUser(grievance.getAssignedStaff(), 
                        "URGENT: Grievance " + grievance.getReferenceNumber() + " assigned to you has breached SLA and been escalated.",
                        "SLA_BREACH", grievance.getId());
            }

            // Notify Bank Managers
            List<User> managers = userRepository.findByBankIdAndRole(grievance.getBank().getId(), Role.MANAGER);
            for (User manager : managers) {
                notificationService.notifyUser(manager, 
                        "SLA ALERT: Grievance " + grievance.getReferenceNumber() + " has breached SLA and requires attention.",
                        "SLA_BREACH", grievance.getId());
            }
        }

        grievanceRepository.saveAll(breachedGrievances);
        log.info("SLA Monitor: Successfully escalated {} grievances.", breachedGrievances.size());
        
        // TODO: In Phase 2, trigger SSE Notifications here.
    }
}
