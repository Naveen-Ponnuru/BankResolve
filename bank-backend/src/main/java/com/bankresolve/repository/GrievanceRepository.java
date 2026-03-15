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

    boolean existsByReferenceNumber(String referenceNumber);

    // ─── By Customer ──────────────────────────────────────────────────────────
    List<Grievance> findByCustomerId(Long customerId);

    List<Grievance> findByCustomerIdAndStatus(Long customerId, GrievanceStatus status);

    long countByCustomerId(Long customerId);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.customer.id = :customerId AND g.status IN :statuses")
    long countByCustomerIdAndStatuses(@Param("customerId") Long customerId, @Param("statuses") List<GrievanceStatus> statuses);

    // ─── By Assigned Staff ────────────────────────────────────────────────────
    List<Grievance> findByAssignedStaffId(Long staffId);

    List<Grievance> findByAssignedStaffIdAndStatus(Long staffId, GrievanceStatus status);

    long countByAssignedStaffId(Long staffId);

    // ─── By Assigned Manager ──────────────────────────────────────────────────
    List<Grievance> findByAssignedManagerId(Long managerId);

    // ─── By Resolver ──────────────────────────────────────────────────────────
    List<Grievance> findByResolvedById(Long userId);

    // ─── By Bank ──────────────────────────────────────────────────────────────
    List<Grievance> findByBankId(Long bankId);

    List<Grievance> findByBankIdAndStatus(Long bankId, GrievanceStatus status);

    long countByBankId(Long bankId);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.bank.id = :bankId AND g.status IN :statuses")
    long countByBankIdAndStatuses(@Param("bankId") Long bankId, @Param("statuses") List<GrievanceStatus> statuses);

    // ─── By Bank Code (String) ────────────────────────────────────────────────
    List<Grievance> findByBankCode(String bankCode);

    List<Grievance> findByBankCodeAndStatus(String bankCode, GrievanceStatus status);

    List<Grievance> findByBankCodeAndStatusIn(String bankCode, List<GrievanceStatus> statuses);

    List<Grievance> findByBankCodeAndPriority(String bankCode, Priority priority);

    long countByBankCode(String bankCode);

    long countByBankCodeAndStatus(String bankCode, GrievanceStatus status);

    long countByBankCodeAndStatusIn(String bankCode, List<GrievanceStatus> statuses);

    // ─── By Status / Priority ─────────────────────────────────────────────────
    List<Grievance> findByStatusInAndTargetSlaBeforeAndIsEscalatedFalse(List<GrievanceStatus> statuses, java.time.Instant now);

    List<Grievance> findByCustomerIdAndPriority(Long customerId, Priority priority);
    List<Grievance> findByStatus(GrievanceStatus status);

    List<Grievance> findByPriority(Priority priority);

    long countByStatus(GrievanceStatus status);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.status IN :statuses")
    long countByStatuses(@Param("statuses") List<GrievanceStatus> statuses);

    // ─── Dashboard KPIs ───────────────────────────────────────────────────────
    long countByCustomerIdAndStatus(Long customerId, GrievanceStatus status);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.assignedStaff.id = :staffId " +
           "AND g.status = 'FILED' AND g.targetSla < CURRENT_TIMESTAMP")
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
    // ─── Manager Scoped Queries (Restriction: HIGH or ESCALATED) ──────────────
    @Query("SELECT g FROM Grievance g WHERE g.bankCode = :bankCode AND (g.priority = 'HIGH' OR g.status = 'ESCALATED')")
    List<Grievance> findManagerScopedGrievances(@Param("bankCode") String bankCode);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.bankCode = :bankCode AND (g.priority = 'HIGH' OR g.status = 'ESCALATED')")
    long countManagerScopedTotal(@Param("bankCode") String bankCode);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.bankCode = :bankCode AND (g.priority = 'HIGH' OR g.status = 'ESCALATED') AND g.status IN :statuses")
    long countManagerScopedByStatuses(@Param("bankCode") String bankCode, @Param("statuses") List<GrievanceStatus> statuses);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.bankCode = :bankCode AND (g.priority = 'HIGH' OR g.status = 'ESCALATED') AND g.status = :status")
    long countManagerScopedByStatus(@Param("bankCode") String bankCode, @Param("status") GrievanceStatus status);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE bank_code = :bankCode AND (priority = 'HIGH' OR status = 'ESCALATED') " +
                   "AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getManagerMonthlyTrend(@Param("bankCode") String bankCode);

    // ─── Monthly Trends ──────────────────────────────────────────────────────
    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getGlobalMonthlyTrend();

    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE bank_code = :bankCode AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getBankMonthlyTrend(@Param("bankCode") String bankCode);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE customer_id = :customerId AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getCustomerMonthlyTrend(@Param("customerId") Long customerId);
}
