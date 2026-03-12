package com.in.payroll.service;

import com.in.payroll.dto.DashboardSummaryDTO;
import com.in.payroll.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private AttendanceRepository attendanceRepository;

    public DashboardSummaryDTO getSummary() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();

        dto.setTotalEmployees(employeeRepository.count());
        dto.setTotalDepartments(departmentRepository.count());
        dto.setPendingLeaveRequests(leaveRequestRepository.findByStatus("PENDING").size());

        long activeCount = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()))
                .count();
        dto.setActiveEmployees(activeCount);

        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepository.findByAttendanceDate(today).stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
        long absentToday = attendanceRepository.findByAttendanceDate(today).stream()
                .filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus()))
                .count();
        dto.setPresentTodayCount(presentToday);
        dto.setAbsentTodayCount(absentToday);

        double totalPayroll = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()))
                .mapToDouble(e -> e.getBasicSalary() != null ? e.getBasicSalary() : 0)
                .sum();
        dto.setTotalMonthlyPayroll(Math.round(totalPayroll * 100.0) / 100.0);

        return dto;
    }
}
