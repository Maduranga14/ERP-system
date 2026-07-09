package com.hotelgrande.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "maintenance_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, length = 50)
    private String category; // Air Conditioning, Plumbing, etc.

    @Column(nullable = false, length = 20)
    private String priority; // High, Medium, Low

    @Column(nullable = false, length = 20)
    private String status; // Open, In Progress, Resolved, Closed

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reported_by", length = 100)
    private String reportedBy;

    @Column(name = "reported_date", length = 30)
    private String reportedDate;

    @Column(name = "reported_time", length = 30)
    private String reportedTime;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "resolved_date", length = 30)
    private String resolvedDate;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    public String getRequestCode() {
        return "MR" + String.format("%03d", id);
    }
}
