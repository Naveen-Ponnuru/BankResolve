package com.bankresolve.service;

import com.bankresolve.dto.AdminDashboardDto;
import com.bankresolve.dto.CustomerDashboardDto;
import com.bankresolve.dto.ManagerDashboardDto;
import com.bankresolve.dto.StaffDashboardDto;

public interface DashboardService {
    CustomerDashboardDto getCustomerDashboard(String email);
    StaffDashboardDto getStaffDashboard(String email);
    ManagerDashboardDto getManagerDashboard(String email);
    AdminDashboardDto getAdminDashboard();
}
