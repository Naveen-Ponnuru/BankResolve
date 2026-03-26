package com.bankresolve.controller;

import com.bankresolve.dto.GrievanceFeedbackDto;
import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.dto.GrievanceResponseDto;
import com.bankresolve.dto.GrievanceSummaryDto;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import com.bankresolve.service.GrievanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.CacheControl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/grievances")
@RequiredArgsConstructor
@Tag(name = "Grievance Management", description = "Enterprise grievance workflow endpoints")
@SecurityRequirement(name = "bearerAuth")
public class GrievanceController {

    private final GrievanceService grievanceService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "File a new grievance", 
               description = "Creates a new grievance. bankId and customer info are derived from the authenticated user.")
    public ResponseEntity<GrievanceResponseDto> fileGrievance(Principal principal, @Valid @RequestBody GrievanceRequestDto request) {
        GrievanceResponseDto response = grievanceService.createGrievance(principal.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "List grievances", 
               description = "Returns a list of grievances based on the user's role and bank association. Supports status and priority filters.")
    public ResponseEntity<List<GrievanceResponseDto>> listGrievances(
            Principal principal,
            @RequestParam(required = false) GrievanceStatus status,
            @RequestParam(required = false) Priority priority) {
        return ResponseEntity.ok(grievanceService.listGrievances(principal.getName(), status, priority));
    }

    @GetMapping("/paged")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "List grievances (Paginated)", 
               description = "Returns a paginated list of grievances based on role and bank residency.")
    public ResponseEntity<Page<GrievanceResponseDto>> listGrievancesPaged(
            Principal principal,
            @RequestParam(required = false) GrievanceStatus status,
            @RequestParam(required = false) Priority priority,
            Pageable pageable) {
        return ResponseEntity.ok(grievanceService.listGrievancesPaged(principal.getName(), status, priority, pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get current customer's grievances", 
               description = "Alias for the unified list endpoint, filtered for customers. Supports status and priority filters.")
    public ResponseEntity<List<GrievanceResponseDto>> getMyGrievances(
            Principal principal,
            @RequestParam(required = false) GrievanceStatus status,
            @RequestParam(required = false) Priority priority) {
        return ResponseEntity.ok(grievanceService.listGrievances(principal.getName(), status, priority));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get grievance by ID", 
               description = "Returns detailed grievance info if the user has residency permission.")
    public ResponseEntity<GrievanceResponseDto> getGrievanceById(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(grievanceService.getGrievanceById(id, principal.getName()));
    }

    @PutMapping("/{id}/forward")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Forward grievance to manager", 
               description = "Escalates the grievance to a manager within the same bank.")
    public ResponseEntity<GrievanceResponseDto> forwardGrievance(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(grievanceService.forwardToManager(id, principal.getName()));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Resolve grievance", 
               description = "Marks grievance as RESOLVED. Staff can resolve NORMAL, Managers can resolve HIGH.")
    public ResponseEntity<GrievanceResponseDto> resolveGrievance(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(grievanceService.resolveGrievance(id, principal.getName()));
    }

    @GetMapping("/dashboard-summary")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get dashboard summary counts", 
               description = "Returns total, pending, resolved, and highRisk counts filtered by user role and bank residency.")
    public ResponseEntity<com.bankresolve.dto.GrievanceSummaryDto> getDashboardSummary(Principal principal) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(grievanceService.getDashboardSummary(principal.getName()));
    }

    @GetMapping("/monthly-trend")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get monthly grievance trend", 
               description = "Returns a list of monthly counts for the last 6 months, scoped by user role and residency.")
    public ResponseEntity<List<com.bankresolve.dto.MonthlyTrendDto>> getMonthlyTrend(Principal principal) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(grievanceService.getMonthlyTrend(principal.getName()));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Submit grievance feedback", 
               description = "Allows the customer to provide a rating and comment for a RESOLVED grievance.")
    public ResponseEntity<GrievanceResponseDto> submitFeedback(@PathVariable Long id, @Valid @RequestBody GrievanceFeedbackDto feedback, Principal principal) {
        return ResponseEntity.ok(grievanceService.submitFeedback(id, feedback, principal.getName()));
    }
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update grievance status", 
               description = "Updates the status of a grievance. Role-based validation applies.")
    public ResponseEntity<GrievanceResponseDto> updateStatus(
            @PathVariable Long id, 
            @Valid @RequestBody com.bankresolve.dto.UpdateStatusRequestDto request, 
            Principal principal) {
        return ResponseEntity.ok(grievanceService.updateStatus(id, request.getStatus(), principal.getName()));
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get recent customer feedback", description = "Returns a list of grievances with ratings and comments, filtered by bank.")
    public ResponseEntity<List<GrievanceResponseDto>> getRecentFeedback(Principal principal) {
        return ResponseEntity.ok(grievanceService.getRecentFeedback(principal.getName()));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get current customer's grievances (Phase 2)", 
               description = "Returns a list of grievances for the authenticated customer.")
    public ResponseEntity<List<GrievanceResponseDto>> getCustomerGrievances(Principal principal) {
        return ResponseEntity.ok(grievanceService.listGrievances(principal.getName(), null, null));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get grievance history", 
               description = "Returns a timeline of status changes for a specific grievance.")
    public ResponseEntity<List<com.bankresolve.dto.GrievanceHistoryDto>> getGrievanceHistory(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(grievanceService.getGrievanceHistory(id, principal.getName()));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Withdraw grievance", description = "Allows a customer to withdraw their own grievance.")
    public ResponseEntity<GrievanceResponseDto> withdrawGrievance(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(grievanceService.withdrawGrievance(id, principal.getName()));
    }
}
