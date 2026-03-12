package com.in.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "pay_slips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PaySlip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private int month;
    private int year;

    @Column(name = "basic_salary")   private Double basicSalary;
    @Column(name = "hra")            private Double hra;
    @Column(name = "pf_deduction")   private Double pfDeduction;
    @Column(name = "tax_deduction")  private Double taxDeduction;
    @Column(name = "bonus")          private Double bonus;
    @Column(name = "net_salary")     private Double netSalary;

    // Attendance deduction fields
    @Column(name = "attendance_percentage") private Double attendancePercentage;  // e.g. 68.5
    @Column(name = "attendance_deduction")  private Double attendanceDeduction;   // amount deducted (5% of net)
    @Column(name = "attendance_note")       private String attendanceNote;        // e.g. "5% deducted — 68.5% attendance"

    @Column(name = "generated_on")   private LocalDate generatedOn;
    private String status;
}