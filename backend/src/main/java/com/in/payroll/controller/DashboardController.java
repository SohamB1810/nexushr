package com.in.payroll.controller;

import com.in.payroll.dto.DashboardSummaryDTO;
import com.in.payroll.entity.PaySlip;
import com.in.payroll.repository.PaySlipRepository;
import com.in.payroll.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final PaySlipRepository paySlipRepository;

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary() {
        return dashboardService.getSummary();
    }

    // Real payroll trend — one entry per month that has payslips
    // Returns [{ month: "Mar 2026", amount: 125000.0 }, ...]
    @GetMapping("/payroll-trend")
    public List<Map<String, Object>> getPayrollTrend() {
        List<PaySlip> all = paySlipRepository.findAll();

        // Group by year+month, sum netSalary
        Map<String, Double> grouped = new LinkedHashMap<>();
        all.stream()
            .sorted(Comparator.comparingInt(PaySlip::getYear).thenComparingInt(PaySlip::getMonth))
            .forEach(ps -> {
                String key = Month.of(ps.getMonth()).getDisplayName(
                    java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH)
                    + " " + ps.getYear();
                grouped.merge(key, ps.getNetSalary() != null ? ps.getNetSalary() : 0.0, Double::sum);
            });

        return grouped.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("month", e.getKey());
                m.put("amount", Math.round(e.getValue() * 100.0) / 100.0);
                return m;
            })
            .collect(Collectors.toList());
    }
}
