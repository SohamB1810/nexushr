package com.in.payroll.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.in.payroll.entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

}