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

    List<Grievance> findByCustomerIdAndPriority(Long customerId, Priority priority);

    long countByCustomerIdAndStatus(Long customerId, GrievanceStatus status);

    long countByStatus(GrievanceStatus status);

    @Query("SELECT new com.bankresolve.dto.StaffWorkloadDto(u.fullName, COUNT(g)) " +
           "FROM User u LEFT JOIN Grievance g ON g.assignedStaff = u " +
           "WHERE u.role = 'STAFF' " +
           "GROUP BY u.id, u.fullName")
    List<com.bankresolve.dto.StaffWorkloadDto> getStaffWorkload();

    @Query("SELECT COALESCE(AVG(TIMESTAMPDIFF(HOUR, g.createdAt, g.resolvedAt)), 0.0) " +
           "FROM Grievance g WHERE g.status = 'RESOLVED'")
    Double getAverageResolutionTimeGlobal();

    @Query("SELECT COALESCE(AVG(TIMESTAMPDIFF(HOUR, g.createdAt, g.resolvedAt)), 0.0) " +
           "FROM Grievance g WHERE g.customer.id = :customerId AND g.status = 'RESOLVED'")
    Double getAverageResolutionTimeByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.assignedStaff.id = :staffId AND g.status IN :statuses")
    long countByStaffAndStatuses(@Param("staffId") Long staffId,
                                 @Param("statuses") List<GrievanceStatus> statuses);

    // ─── Unassigned ───────────────────────────────────────────────────────────
    List<Grievance> findByAssignedStaffIsNull();

    // ─── Customer-Scoped Safe Lookups (IDOR Prevention) ──────────────────────
    Optional<Grievance> findByIdAndCustomerId(Long id, Long customerId);

    // ─── Manager Scoped Queries (Restriction: HIGH or ESCALATED) ──────────────
    @Query("SELECT g FROM Grievance g WHERE g.priority = 'HIGH' OR g.status = 'ESCALATED'")
    List<Grievance> findManagerScopedGrievances();

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.priority = 'HIGH' OR g.status = 'ESCALATED'")
    long countManagerScopedTotal();

    @Query("SELECT COUNT(g) FROM Grievance g WHERE (g.priority = 'HIGH' OR g.status = 'ESCALATED') AND g.status IN :statuses")
    long countManagerScopedByStatuses(@Param("statuses") List<GrievanceStatus> statuses);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE (g.priority = 'HIGH' OR g.status = 'ESCALATED') AND g.status = :status")
    long countManagerScopedByStatus(@Param("status") GrievanceStatus status);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE (priority = 'HIGH' OR status = 'ESCALATED') " +
                   "AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getManagerMonthlyTrend();

    // ─── Monthly Trends ──────────────────────────────────────────────────────
    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getGlobalMonthlyTrend();

    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count " +
                   "FROM grievances WHERE customer_id = :customerId AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY month, YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC", nativeQuery = true)
    List<Object[]> getCustomerMonthlyTrend(@Param("customerId") Long customerId);

    // ─── Feedback Queries ────────────────────────────────────────────────────
    @Query("SELECT g FROM Grievance g WHERE g.feedbackRating IS NOT NULL ORDER BY g.resolvedAt DESC")
    List<Grievance> findRecentFeedbackGlobal();

    @Query("SELECT g FROM Grievance g WHERE g.feedbackRating IS NOT NULL AND (g.resolvedRole = :role OR g.resolvedBy.id = :userId) ORDER BY g.feedbackAt DESC")
    List<Grievance> findRecentFeedbackByResolver(@Param("role") com.bankresolve.entity.enums.Role role, @Param("userId") Long userId);

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.resolvedRole = :role")
    long countByResolvedRole(@Param("role") com.bankresolve.entity.enums.Role role);
}

