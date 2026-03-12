package com.in.payroll.repository;

import com.in.payroll.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String first, String last);
    List<Employee> findByDepartmentId(Long departmentId);
    List<Employee> findByStatus(String status);
    Optional<Employee> findByEmployeeCode(String employeeCode);
}
