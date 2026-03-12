package com.in.payroll.service;

import com.in.payroll.entity.Department;
import java.util.List;

public interface DepartmentService {

    // Get all departments (sorted by id)
    List<Department> getAllDepartments();

    // Get department by id
    Department getDepartmentById(Long id);

    // Create or update department
    Department saveDepartment(Department department);

    // Delete department
    void deleteDepartment(Long id);
}