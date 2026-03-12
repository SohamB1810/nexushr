package com.in.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Rating 1 to 5
    private Integer rating;

    // EXCELLENT, GOOD, AVERAGE, POOR
    private String grade;

    private String feedback;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(name = "reviewer_name")
    private String reviewerName;

    // Q1, Q2, Q3, Q4, ANNUAL
    @Column(name = "review_period")
    private String reviewPeriod;

    private int year;
}
