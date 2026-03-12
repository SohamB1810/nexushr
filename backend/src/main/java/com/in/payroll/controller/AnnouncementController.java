package com.in.payroll.controller;

import com.in.payroll.entity.Announcement;
import com.in.payroll.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // Create a new announcement
    @PostMapping
    public Announcement create(@RequestBody Announcement announcement) {
        return announcementService.createAnnouncement(announcement);
    }

    // Get all active announcements
    @GetMapping
    public List<Announcement> getActive() {
        return announcementService.getAllActive();
    }

    // Get all (including archived)
    @GetMapping("/all")
    public List<Announcement> getAll() {
        return announcementService.getAll();
    }

    // Get by target department
    @GetMapping("/department/{dept}")
    public List<Announcement> getByDepartment(@PathVariable String dept) {
        return announcementService.getByDepartment(dept);
    }

    // Archive an announcement
    @PutMapping("/{id}/archive")
    public Announcement archive(@PathVariable Long id) {
        return announcementService.archiveAnnouncement(id);
    }

    // Delete permanently
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return "Announcement deleted successfully";
    }
}
