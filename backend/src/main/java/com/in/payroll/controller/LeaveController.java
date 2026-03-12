package com.in.payroll.controller;

import com.in.payroll.entity.LeaveRequest;
import com.in.payroll.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // Apply for a leave
    @PostMapping
    public LeaveRequest applyLeave(@RequestBody LeaveRequest request) {
        return leaveService.applyLeave(request);
    }

    // Get all leave requests
    @GetMapping
    public List<LeaveRequest> getAll() {
        return leaveService.getAllLeaves();
    }

    // Get only pending leave requests
    @GetMapping("/pending")
    public List<LeaveRequest> getPending() {
        return leaveService.getPendingLeaves();
    }

    // Get leave requests by employee
    @GetMapping("/employee/{employeeId}")
    public List<LeaveRequest> getByEmployee(@PathVariable Long employeeId) {
        return leaveService.getLeavesByEmployee(employeeId);
    }

    // Approve or Reject a leave
    // Body: { "status": "APPROVED", "reviewedBy": "HR Manager", "remarks": "OK" }
    @PutMapping("/{id}/review")
    public LeaveRequest reviewLeave(
            @PathVariable Long id,
            @RequestBody Map<String, String> reviewData) {
        return leaveService.reviewLeave(
                id,
                reviewData.get("status"),
                reviewData.get("reviewedBy"),
                reviewData.get("remarks")
        );
    }

    // Delete leave request
    @DeleteMapping("/{id}")
    public String deleteLeave(@PathVariable Long id) {
        leaveService.deleteLeave(id);
        return "Leave request deleted successfully";
    }
}
