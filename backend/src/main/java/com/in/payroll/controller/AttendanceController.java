package com.in.payroll.controller;

import com.in.payroll.entity.Attendance;
import com.in.payroll.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Mark attendance for an employee
    @PostMapping
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    // Get all attendance records for an employee
    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getByEmployee(@PathVariable Long employeeId) {
        return attendanceService.getAttendanceByEmployee(employeeId);
    }

    // Get today's attendance for all employees
    @GetMapping("/today")
    public List<Attendance> getTodaysAttendance() {
        return attendanceService.getTodaysAttendance();
    }

    // Get attendance by specific date
    @GetMapping("/date/{date}")
    public List<Attendance> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getAttendanceByDate(date);
    }

    // Monthly summary for an employee (PRESENT/ABSENT counts)
    @GetMapping("/employee/{employeeId}/summary")
    public Map<String, Long> getMonthlySummary(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        return attendanceService.getMonthlySummary(employeeId, month, year);
    }

    // Get attendance between date range for an employee
    @GetMapping("/employee/{employeeId}/range")
    public List<Attendance> getInRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return attendanceService.getAttendanceInRange(employeeId, start, end);
    }

    // Update attendance record
    @PutMapping("/{id}")
    public Attendance updateAttendance(@PathVariable Long id, @RequestBody Attendance attendance) {
        return attendanceService.updateAttendance(id, attendance);
    }

    // Delete attendance record
    @DeleteMapping("/{id}")
    public String deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return "Attendance record deleted successfully";
    }
}
