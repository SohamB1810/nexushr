package com.in.payroll.service;

import com.in.payroll.entity.LeaveRequest;
import com.in.payroll.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    public LeaveRequest applyLeave(LeaveRequest request) {
        request.setStatus("PENDING");
        request.setAppliedOn(LocalDate.now());
        return leaveRequestRepository.save(request);
    }

    public LeaveRequest reviewLeave(Long leaveId, String status, String reviewedBy, String remarks) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + leaveId));

        if (!"PENDING".equals(leave.getStatus())) {
            throw new RuntimeException("Leave request already reviewed!");
        }

        leave.setStatus(status);        // APPROVED or REJECTED
        leave.setReviewedBy(reviewedBy);
        leave.setReviewRemarks(remarks);
        return leaveRequestRepository.save(leave);
    }

    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }

    public List<LeaveRequest> getPendingLeaves() {
        return leaveRequestRepository.findByStatus("PENDING");
    }

    public List<LeaveRequest> getLeavesByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public long getDaysCount(LeaveRequest request) {
        return ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
    }

    public void deleteLeave(Long id) {
        leaveRequestRepository.deleteById(id);
    }
}
