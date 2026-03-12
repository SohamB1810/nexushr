package com.in.payroll.controller;

import com.in.payroll.dto.SalaryBreakdownDTO;
import com.in.payroll.entity.PaySlip;
import com.in.payroll.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final SalaryService salaryService;

    // Get detailed salary breakdown for any basic salary
    // ?basicSalary=50000&bonus=5000
    @GetMapping("/breakdown")
    public SalaryBreakdownDTO getBreakdown(
            @RequestParam double basicSalary,
            @RequestParam(defaultValue = "0") double bonus) {
        return salaryService.getSalaryBreakdown(basicSalary, bonus);
    }

    // Generate payslip for a specific employee and month
    // Body: { "month": 3, "year": 2026, "bonus": 2000 }
    @PostMapping("/employee/{employeeId}/generate")
    public PaySlip generatePaySlip(
            @PathVariable Long employeeId,
            @RequestBody Map<String, Object> body) {
        int month = (int) body.get("month");
        int year  = (int) body.get("year");
        Double bonus = body.containsKey("bonus") ? ((Number) body.get("bonus")).doubleValue() : 0.0;
        return salaryService.generatePaySlip(employeeId, month, year, bonus);
    }

    // Run monthly payroll for ALL active employees at once
    @PostMapping("/run")
    public List<PaySlip> runMonthlyPayroll(@RequestBody Map<String, Integer> body) {
        return salaryService.runMonthlyPayroll(body.get("month"), body.get("year"));
    }

    // Get all payslips for one employee
    @GetMapping("/employee/{employeeId}")
    public List<PaySlip> getPaySlipsByEmployee(@PathVariable Long employeeId) {
        return salaryService.getPaySlipsByEmployee(employeeId);
    }

    // Get all payslips for a given month
    @GetMapping("/month")
    public List<PaySlip> getPaySlipsByMonth(
            @RequestParam int month,
            @RequestParam int year) {
        return salaryService.getPaySlipsByMonth(month, year);
    }
}
