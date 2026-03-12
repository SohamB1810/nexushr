package com.in.payroll.repository;

import com.in.payroll.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {

    List<PerformanceReview> findByEmployeeId(Long employeeId);

    List<PerformanceReview> findByYear(int year);

    List<PerformanceReview> findByEmployeeIdAndYear(Long employeeId, int year);
}
