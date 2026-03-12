package com.in.payroll.controller;

import com.in.payroll.entity.PerformanceReview;
import com.in.payroll.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    // Add a new review
    @PostMapping
    public PerformanceReview addReview(@RequestBody PerformanceReview review) {
        return performanceService.addReview(review);
    }

    // Get all reviews
    @GetMapping
    public List<PerformanceReview> getAll() {
        return performanceService.getAllReviews();
    }

    // Get reviews by employee
    @GetMapping("/employee/{employeeId}")
    public List<PerformanceReview> getByEmployee(@PathVariable Long employeeId) {
        return performanceService.getReviewsByEmployee(employeeId);
    }

    // Get reviews by year
    @GetMapping("/year/{year}")
    public List<PerformanceReview> getByYear(@PathVariable int year) {
        return performanceService.getReviewsByYear(year);
    }

    // Update a review
    @PutMapping("/{id}")
    public PerformanceReview updateReview(@PathVariable Long id, @RequestBody PerformanceReview review) {
        return performanceService.updateReview(id, review);
    }

    // Delete a review
    @DeleteMapping("/{id}")
    public String deleteReview(@PathVariable Long id) {
        performanceService.deleteReview(id);
        return "Review deleted successfully";
    }
}
