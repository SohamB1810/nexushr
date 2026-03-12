package com.in.payroll.controller;

import com.in.payroll.entity.Department;
import com.in.payroll.entity.Employee;
import com.in.payroll.repository.DepartmentRepository;
import com.in.payroll.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public List<Department> getAll() {
        return departmentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Department body) {
        try {
            if (body.getName() == null || body.getName().isBlank()) {
                return ResponseEntity.badRequest().body("Department name is required");
            }
            Department dept = new Department(body.getName().trim());
            Department saved = departmentRepository.save(dept);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
            // Duplicate name
            if (msg.contains("Duplicate") || msg.contains("unique")) {
                return ResponseEntity.badRequest().body("A department with that name already exists");
            }
            return ResponseEntity.internalServerError().body("Failed to create department: " + msg);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            Department dept = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Department not found"));

            // Unlink all employees from this department so the FK constraint is released
            List<Employee> members = employeeRepository.findByDepartmentId(id);
            members.forEach(emp -> emp.setDepartment(null));
            employeeRepository.saveAll(members);

            departmentRepository.delete(dept);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Delete failed: " + ex.getMessage());
        }
    }
}
