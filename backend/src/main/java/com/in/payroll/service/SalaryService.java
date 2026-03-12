package com.in.payroll.service;

import com.in.payroll.dto.SalaryBreakdownDTO;
import com.in.payroll.entity.Employee;
import com.in.payroll.entity.PaySlip;
import com.in.payroll.repository.AttendanceRepository;
import com.in.payroll.repository.EmployeeRepository;
import com.in.payroll.repository.PaySlipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class SalaryService {

    @Autowired private EmployeeRepository    employeeRepository;
    @Autowired private PaySlipRepository     paySlipRepository;
    @Autowired private AttendanceRepository  attendanceRepository;

    // ── Attendance % for an employee in a given month ─────────────────────
    // Counts working days in the month (Mon-Fri), then calculates
    // (PRESENT + LATE + HALF_DAY*0.5) / workingDays * 100
    public double getAttendancePercentage(Long employeeId, int month, int year) {
        YearMonth ym    = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end   = ym.atEndOfMonth();

        // Count Mon-Fri working days in the month
        long workingDays = start.datesUntil(end.plusDays(1))
            .filter(d -> {
                int dow = d.getDayOfWeek().getValue(); // 1=Mon .. 7=Sun
                return dow <= 5;
            }).count();

        if (workingDays == 0) return 100.0;

        long present  = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "PRESENT",  start, end);
        long late     = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "LATE",     start, end);
        long halfDay  = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "HALF_DAY", start, end);
        // ON_LEAVE days are neither present nor absent — exclude from denominator
        long onLeave  = attendanceRepository.countByEmployeeIdAndStatusAndAttendanceDateBetween(employeeId, "ON_LEAVE", start, end);

        long effectiveDays = workingDays - onLeave;
        if (effectiveDays <= 0) return 100.0;

        double score = present + late + (halfDay * 0.5);
        double pct   = (score / effectiveDays) * 100.0;
        return Math.min(100.0, Math.round(pct * 10.0) / 10.0);
    }

    // ── Build a payslip with attendance deduction applied ─────────────────
    private PaySlip buildPaySlip(Employee emp, int month, int year, Double bonus) {
        SalaryBreakdownDTO bd = new SalaryBreakdownDTO(emp.getBasicSalary(), bonus);

        double attPct       = getAttendancePercentage(emp.getId(), month, year);
        double attDeduction = 0.0;
        String attNote      = String.format("%.1f%% attendance", attPct);

        if (attPct < 75.0) {
            attDeduction = Math.round(bd.getNetSalary() * 0.05 * 100.0) / 100.0;
            attNote      = String.format("5%% deducted — %.1f%% attendance (below 75%%)", attPct);
        }

        double finalNet = Math.round((bd.getNetSalary() - attDeduction) * 100.0) / 100.0;

        PaySlip ps = new PaySlip();
        ps.setEmployee(emp);
        ps.setMonth(month);
        ps.setYear(year);
        ps.setBasicSalary(bd.getBasicSalary());
        ps.setHra(bd.getHra());
        ps.setPfDeduction(bd.getPfDeduction());
        ps.setTaxDeduction(bd.getTaxDeduction());
        ps.setBonus(bonus != null ? bonus : 0.0);
        ps.setAttendancePercentage(attPct);
        ps.setAttendanceDeduction(attDeduction);
        ps.setAttendanceNote(attNote);
        ps.setNetSalary(finalNet);
        ps.setGeneratedOn(LocalDate.now());
        ps.setStatus("GENERATED");
        return ps;
    }

    public double calculateNetSalary(double basicSalary) {
        return new SalaryBreakdownDTO(basicSalary, 0.0).getNetSalary();
    }

    public SalaryBreakdownDTO getSalaryBreakdown(double basicSalary, Double bonus) {
        return new SalaryBreakdownDTO(basicSalary, bonus);
    }

    public PaySlip generatePaySlip(Long employeeId, int month, int year, Double bonus) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
        paySlipRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year)
                .ifPresent(p -> { throw new RuntimeException("Payslip already generated for this month!"); });
        return paySlipRepository.save(buildPaySlip(emp, month, year, bonus));
    }

    public List<PaySlip> runMonthlyPayroll(int month, int year) {
        return employeeRepository.findAll().stream()
            .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()))
            .map(emp -> paySlipRepository
                .findByEmployeeIdAndMonthAndYear(emp.getId(), month, year)
                .orElseGet(() -> paySlipRepository.save(buildPaySlip(emp, month, year, 0.0))))
            .toList();
    }

    public List<PaySlip> getPaySlipsByEmployee(Long employeeId) {
        return paySlipRepository.findByEmployeeId(employeeId);
    }

    public List<PaySlip> getPaySlipsByMonth(int month, int year) {
        return paySlipRepository.findByMonthAndYear(month, year);
    }
}
