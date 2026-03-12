package com.in.payroll.service;

import com.in.payroll.entity.PerformanceReview;
import com.in.payroll.repository.PerformanceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PerformanceService {

    @Autowired
    private PerformanceReviewRepository reviewRepository;

    public PerformanceReview addReview(PerformanceReview review) {
        if (review.getReviewDate() == null) {
            review.setReviewDate(LocalDate.now());
        }
        review.setGrade(computeGrade(review.getRating()));
        return reviewRepository.save(review);
    }

    public List<PerformanceReview> getReviewsByEmployee(Long employeeId) {
        return reviewRepository.findByEmployeeId(employeeId);
    }

    public List<PerformanceReview> getReviewsByYear(int year) {
        return reviewRepository.findByYear(year);
    }

    public List<PerformanceReview> getAllReviews() {
        return reviewRepository.findAll();
    }

    public PerformanceReview updateReview(Long id, PerformanceReview updated) {
        PerformanceReview existing = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        existing.setRating(updated.getRating());
        existing.setGrade(computeGrade(updated.getRating()));
        existing.setFeedback(updated.getFeedback());
        existing.setReviewerName(updated.getReviewerName());
        existing.setReviewPeriod(updated.getReviewPeriod());
        return reviewRepository.save(existing);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    private String computeGrade(Integer rating) {
        if (rating == null) return "N/A";
        return switch (rating) {
            case 5 -> "EXCELLENT";
            case 4 -> "GOOD";
            case 3 -> "AVERAGE";
            case 2 -> "BELOW_AVERAGE";
            default -> "POOR";
        };
    }
}
