package com.in.payroll.repository;

import com.in.payroll.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByStatus(String status);

    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, String status);

    long countByEmployeeIdAndLeaveTypeAndStatus(Long employeeId, String leaveType, String status);
}
