package com.in.payroll.dto;

public class DashboardSummaryDTO {

    private long totalEmployees;
    private long activeEmployees;
    private long totalDepartments;
    private long pendingLeaveRequests;
    private long presentTodayCount;
    private long absentTodayCount;
    private Double totalMonthlyPayroll;

    // Getters and Setters
    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getActiveEmployees() { return activeEmployees; }
    public void setActiveEmployees(long activeEmployees) { this.activeEmployees = activeEmployees; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getPendingLeaveRequests() { return pendingLeaveRequests; }
    public void setPendingLeaveRequests(long pendingLeaveRequests) { this.pendingLeaveRequests = pendingLeaveRequests; }

    public long getPresentTodayCount() { return presentTodayCount; }
    public void setPresentTodayCount(long presentTodayCount) { this.presentTodayCount = presentTodayCount; }

    public long getAbsentTodayCount() { return absentTodayCount; }
    public void setAbsentTodayCount(long absentTodayCount) { this.absentTodayCount = absentTodayCount; }

    public Double getTotalMonthlyPayroll() { return totalMonthlyPayroll; }
    public void setTotalMonthlyPayroll(Double totalMonthlyPayroll) { this.totalMonthlyPayroll = totalMonthlyPayroll; }
}
