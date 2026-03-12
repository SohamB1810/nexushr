package com.in.payroll.dto;

public class SalaryBreakdownDTO {

    private Double basicSalary;
    private Double hra;
    private Double pfDeduction;
    private Double taxDeduction;
    private Double bonus;
    private Double grossSalary;
    private Double totalDeductions;
    private Double netSalary;

    public SalaryBreakdownDTO(Double basicSalary, Double bonus) {
        this.basicSalary = basicSalary;
        this.hra = round(basicSalary * 0.20);
        this.pfDeduction = round(basicSalary * 0.12);
        this.taxDeduction = round(basicSalary * 0.10);
        this.bonus = bonus != null ? bonus : 0.0;
        this.grossSalary = round(basicSalary + this.hra + this.bonus);
        this.totalDeductions = round(this.pfDeduction + this.taxDeduction);
        this.netSalary = round(this.grossSalary - this.totalDeductions);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // Getters
    public Double getBasicSalary() { return basicSalary; }
    public Double getHra() { return hra; }
    public Double getPfDeduction() { return pfDeduction; }
    public Double getTaxDeduction() { return taxDeduction; }
    public Double getBonus() { return bonus; }
    public Double getGrossSalary() { return grossSalary; }
    public Double getTotalDeductions() { return totalDeductions; }
    public Double getNetSalary() { return netSalary; }
}
