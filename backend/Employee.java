package com.in.payroll.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Random;

@Entity
@Table(name = "employees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_code", unique = true)
    private String employeeCode;

    @Column(name = "first_name")  private String firstName;
    @Column(name = "last_name")   private String lastName;
    private String email;
    private String phone;

    @Column(name = "hire_date")    private LocalDate hireDate;
    @Column(name = "basic_salary") private Double basicSalary;

    private String status;
    private String designation;

    @Column(name = "employment_type") private String employmentType;
    @Column(name = "date_of_birth")   private LocalDate dateOfBirth;
    private String gender;
    private String address;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties("employees")
    private Department department;

    /**
     * Generates a department-prefixed employee code, e.g.
     *   HR-482931   for Human Resources
     *   ENG-482931  for Engineering
     *   FIN-482931  for Finance
     *   SAL-482931  for Sales
     *   MKT-482931  for Marketing
     *   DEV-482931  for DevOps / Development
     *   OPS-482931  for Operations
     *   EMP-482931  for unknown / no department
     * Called from EmployeeController after department is resolved.
     */
    public static String generateCode(String departmentName) {
        String digits = String.valueOf(100000 + new Random().nextInt(900000));
        String prefix = deptPrefix(departmentName);
        return prefix + "-" + digits;
    }

    private static String deptPrefix(String name) {
        if (name == null || name.isBlank()) return "EMP";
        String n = name.trim().toLowerCase();
        if (n.contains("human")  || n.contains("hr"))         return "HR";
        if (n.contains("engine") || n.contains("eng"))        return "ENG";
        if (n.contains("financ") || n.contains("fin"))        return "FIN";
        if (n.contains("sales")  || n.contains("sal"))        return "SAL";
        if (n.contains("market") || n.contains("mkt"))        return "MKT";
        if (n.contains("devops") || n.contains("dev"))        return "DEV";
        if (n.contains("operat") || n.contains("ops"))        return "OPS";
        if (n.contains("legal")  || n.contains("leg"))        return "LEG";
        if (n.contains("design") || n.contains("des"))        return "DES";
        if (n.contains("product")|| n.contains("prod"))       return "PRD";
        if (n.contains("data")   || n.contains("analyt"))     return "DAT";
        if (n.contains("support")|| n.contains("sup"))        return "SUP";
        // fallback: first 3 letters uppercased
        return name.replaceAll("[^a-zA-Z]", "").substring(0, Math.min(3, name.replaceAll("[^a-zA-Z]","").length())).toUpperCase();
    }

    // Fallback @PrePersist in case code is still null (e.g. seeded via SQL)
    @PrePersist
    public void ensureEmployeeCode() {
        if (this.employeeCode == null || this.employeeCode.isBlank()) {
            String deptName = this.department != null ? this.department.getName() : null;
            this.employeeCode = generateCode(deptName);
        }
    }
}
