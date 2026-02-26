package com.bankresolve.controller;

import com.bankresolve.dto.AdminDashboardDto;
import com.bankresolve.dto.CustomerDashboardDto;
import com.bankresolve.dto.ManagerDashboardDto;
import com.bankresolve.dto.StaffDashboardDto;
import com.bankresolve.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Role-scoped dashboard endpoints.
 * Each endpoint is protected by both URL-level security (SecurityConfig)
 * AND method-level @PreAuthorize for double enforcement.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Dashboards", description = "Role-specific dashboard KPI endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/customer/dashboard")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Customer dashboard",
               description = "Returns grievance counts for the authenticated customer")
    public ResponseEntity<CustomerDashboardDto> getCustomerDashboard(Principal principal) {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(principal.getName()));
    }

    @GetMapping("/staff/dashboard")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Staff dashboard",
               description = "Returns assigned/pending/SLA breach counts for the authenticated staff member")
    public ResponseEntity<StaffDashboardDto> getStaffDashboard(Principal principal) {
        return ResponseEntity.ok(dashboardService.getStaffDashboard(principal.getName()));
    }

    @GetMapping("/manager/dashboard")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Manager dashboard",
               description = "Returns bank-wide grievance stats and staff workload")
    public ResponseEntity<ManagerDashboardDto> getManagerDashboard(Principal principal) {
        return ResponseEntity.ok(dashboardService.getManagerDashboard(principal.getName()));
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin dashboard",
               description = "Returns system-wide counts: banks, users, grievances")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
