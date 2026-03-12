package com.in.payroll.controller;

import com.in.payroll.entity.Employee;
import com.in.payroll.repository.*;
import com.in.payroll.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository         employeeRepository;
    private final AttendanceRepository       attendanceRepository;
    private final LeaveRequestRepository     leaveRequestRepository;
    private final PaySlipRepository          paySlipRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final DepartmentRepository       departmentRepository;
    private final SalaryService              salaryService;

    @GetMapping
    public List<Employee> getAll() { return employeeRepository.findAll(); }

    @GetMapping("/{id}")
    public Employee getById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
    }

    // Lookup by 6-digit code — returns full profile + latest payslip info
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getByCode(@PathVariable String code) {
        return employeeRepository.findByEmployeeCode(code.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Attendance % for an employee in a given month
    @GetMapping("/{id}/attendance-percentage")
    public Map<String, Object> getAttendancePct(
            @PathVariable Long id,
            @RequestParam int month,
            @RequestParam int year) {
        double pct = salaryService.getAttendancePercentage(id, month, year);
        boolean deducted = pct < 75.0;
        return Map.of(
            "employeeId", id,
            "month", month,
            "year", year,
            "attendancePercentage", pct,
            "belowThreshold", deducted,
            "deductionApplied", deducted ? "5% salary deduction" : "None"
        );
    }

    @PostMapping
    public Employee create(@RequestBody Employee employee) {
        // Look up department name to generate a dept-prefixed code (e.g. HR-482931, ENG-482931)
        String deptName = null;
        if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
            deptName = departmentRepository.findById(employee.getDepartment().getId())
                .map(d -> d.getName())
                .orElse(null);
        }
        employee.setEmployeeCode(Employee.generateCode(deptName));
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}")
    public Employee update(@PathVariable Long id, @RequestBody Employee emp) {
        Employee ex = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        ex.setFirstName(emp.getFirstName());
        ex.setLastName(emp.getLastName());
        ex.setEmail(emp.getEmail());
        ex.setPhone(emp.getPhone());
        ex.setHireDate(emp.getHireDate());
        ex.setBasicSalary(emp.getBasicSalary());
        ex.setStatus(emp.getStatus());
        ex.setDesignation(emp.getDesignation());
        ex.setEmploymentType(emp.getEmploymentType());
        ex.setGender(emp.getGender());
        ex.setAddress(emp.getAddress());
        ex.setDepartment(emp.getDepartment());
        return employeeRepository.save(ex);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) return "Employee not found";
        attendanceRepository.deleteAll(attendanceRepository.findByEmployeeId(id));
        leaveRequestRepository.deleteAll(leaveRequestRepository.findByEmployeeId(id));
        paySlipRepository.deleteAll(paySlipRepository.findByEmployeeId(id));
        performanceReviewRepository.deleteAll(performanceReviewRepository.findByEmployeeId(id));
        employeeRepository.deleteById(id);
        return "Employee deleted";
    }

    @GetMapping("/search")
    public List<Employee> search(@RequestParam String keyword) {
        return employeeRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword);
    }

    @GetMapping("/department/{deptId}")
    public List<Employee> byDept(@PathVariable Long deptId) {
        return employeeRepository.findByDepartmentId(deptId);
    }

    @GetMapping("/status/{status}")
    public List<Employee> byStatus(@PathVariable String status) {
        return employeeRepository.findByStatus(status);
    }
}
