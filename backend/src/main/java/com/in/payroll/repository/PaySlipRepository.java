package com.in.payroll.repository;

import com.in.payroll.entity.PaySlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaySlipRepository extends JpaRepository<PaySlip, Long> {

    List<PaySlip> findByEmployeeId(Long employeeId);

    Optional<PaySlip> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);

    List<PaySlip> findByMonthAndYear(int month, int year);
}
