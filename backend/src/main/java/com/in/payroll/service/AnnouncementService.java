package com.in.payroll.service;

import com.in.payroll.entity.Announcement;
import com.in.payroll.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public Announcement createAnnouncement(Announcement announcement) {
        announcement.setPostedOn(LocalDate.now());
        announcement.setStatus("ACTIVE");
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAllActive() {
        return announcementRepository.findByStatus("ACTIVE");
    }

    public List<Announcement> getAll() {
        return announcementRepository.findAll();
    }

    public List<Announcement> getByDepartment(String department) {
        return announcementRepository.findByTargetDepartmentOrTargetDepartment(department, "ALL");
    }

    public Announcement archiveAnnouncement(Long id) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));
        a.setStatus("ARCHIVED");
        return announcementRepository.save(a);
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
