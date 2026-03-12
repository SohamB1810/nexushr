package com.in.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    // ALL, HR, ENGINEERING, SALES, etc.
    private String targetDepartment;

    @Column(name = "posted_on")
    private LocalDate postedOn;

    @Column(name = "posted_by")
    private String postedBy;

    // ACTIVE, ARCHIVED
    private String status = "ACTIVE";
}
