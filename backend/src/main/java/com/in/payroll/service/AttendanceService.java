package com.in.payroll.service;

import com.in.payroll.entity.Attendance;
import com.in.payroll.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Attendance markAttendance(Attendance attendance) {
        if (attendance.getAttendanceDate() == null) {
            attendance.setAttendanceDate(LocalDate.now());
        }
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public List<Attendance> getTodaysAttendance() {
        return attendanceRepository.findByAttendanceDate(LocalDate.now());
    }

    public List<Attendance> getAttendanceInRange(Long employeeId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end);
    }

    // Summary: count PRESENT, ABSENT etc. in a month for an employee
    public Map<String, Long> getMonthlySummary(Long employeeId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        long present = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "PRESENT", start, end);
        long absent  = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "ABSENT",  start, end);
        long halfDay = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "HALF_DAY",start, end);
        long late    = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "LATE",    start, end);

        return Map.of(
            "PRESENT",  present,
            "ABSENT",   absent,
            "HALF_DAY", halfDay,
            "LATE",     late
        );
    }

    public Attendance updateAttendance(Long id, Attendance updated) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found: " + id));
        existing.setStatus(updated.getStatus());
        existing.setCheckIn(updated.getCheckIn());
        existing.setCheckOut(updated.getCheckOut());
        existing.setRemarks(updated.getRemarks());
        return attendanceRepository.save(existing);
    }

    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
}
