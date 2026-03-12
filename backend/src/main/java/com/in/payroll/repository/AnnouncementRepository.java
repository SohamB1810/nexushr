package com.in.payroll.repository;

import com.in.payroll.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByStatus(String status);

    List<Announcement> findByTargetDepartmentOrTargetDepartment(String dept, String all);
}
