package com.bankresolve.repository;

import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {

    // ─── By Customer ──────────────────────────────────────────────────────────
    List<Grievance> findByCustomerId(Long customerId);

    List<Grievance> findByCustomerIdAndStatus(Long customerId, GrievanceStatus status);

    long countByCustomerId(Long customerId);

    // ─── By Assigned Staff ────────────────────────────────────────────────────
    List<Grievance> findByAssignedStaffId(Long staffId);

    List<Grievance> findByAssignedStaffIdAndStatus(Long staffId, GrievanceStatus status);

    long countByAssignedStaffId(Long staffId);

    // ─── By Bank ──────────────────────────────────────────────────────────────
    List<Grievance> findByBankId(Long bankId);

    List<Grievance> findByBankIdAndStatus(Long bankId, GrievanceStatus status);

    long countByBankId(Long bankId);

    // ─── By Status / Priority ─────────────────────────────────────────────────
    List<Grievance> findByStatus(GrievanceStatus status);

    List<Grievance> findByPriority(Priority priority);

    long countByStatus(GrievanceStatus status);

    // ─── Dashboard KPIs ───────────────────────────────────────────────────────
    long countByCustomerIdAndStatus(Long customerId, GrievanceStatus status);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.assignedStaff.id = :staffId " +
           "AND g.status = 'OPEN' AND g.targetSla < CURRENT_TIMESTAMP")
    long countSlaBreachesByStaffId(@Param("staffId") Long staffId);

    @Query("SELECT new com.bankresolve.dto.StaffWorkloadDto(u.fullName, COUNT(g)) " +
           "FROM User u LEFT JOIN Grievance g ON g.assignedStaff = u " +
           "WHERE u.bank.id = :bankId AND u.role = 'STAFF' " +
           "GROUP BY u.id, u.fullName")
    List<com.bankresolve.dto.StaffWorkloadDto> getStaffWorkloadByBankId(@Param("bankId") Long bankId);

    @Query("SELECT COALESCE(AVG(TIMESTAMPDIFF(HOUR, g.createdAt, g.resolvedAt)), 0.0) " +
           "FROM Grievance g WHERE g.bank.id = :bankId AND g.status = 'RESOLVED'")
    Double getAverageResolutionTimeByBankId(@Param("bankId") Long bankId);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.bank.id = :bankId AND g.status = :status")
    long countByBankIdAndStatus(@Param("bankId") Long bankId, @Param("status") GrievanceStatus status);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.assignedStaff.id = :staffId AND g.status IN :statuses")
    long countByStaffAndStatuses(@Param("staffId") Long staffId,
                                 @Param("statuses") List<GrievanceStatus> statuses);

    // ─── Escalated (for Manager) ──────────────────────────────────────────────
    List<Grievance> findByBankIdAndStatusOrderByCreatedAtDesc(Long bankId, GrievanceStatus status);

    // ─── Unassigned ───────────────────────────────────────────────────────────
    List<Grievance> findByAssignedStaffIsNullAndBankId(Long bankId);

    // ─── Bank-Scoped Safe Lookups (IDOR Prevention) ──────────────────────────
    Optional<Grievance> findByIdAndBankId(Long id, Long bankId);

    Optional<Grievance> findByIdAndCustomerId(Long id, Long customerId);

    List<Grievance> findByCustomerIdAndBankId(Long customerId, Long bankId);

    List<Grievance> findByAssignedStaffIdAndBankId(Long staffId, Long bankId);
}
