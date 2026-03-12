package com.in.payroll.service.impl;

import com.in.payroll.entity.Department;
import com.in.payroll.repository.DepartmentRepository;
import com.in.payroll.service.DepartmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository repository;

    @Override
    public List<Department> getAllDepartments() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @Override
    public Department getDepartmentById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    @Override
    public Department saveDepartment(Department department) {
        return repository.save(department);
    }

    @Override
    public void deleteDepartment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        repository.deleteById(id);
    }
}