package com.hotelgrande.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "housekeeping_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HousekeepingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "housekeeper_id")
    private User housekeeper; // reference to User with Role.HOUSEKEEPER

    @Column(nullable = false, length = 20)
    private String priority; // High, Medium, Low

    @Column(nullable = false, length = 20)
    private String status; // Pending, In Progress, Completed, Delayed

    @Column(name = "due_time", length = 30)
    private String dueTime;

    @Column(name = "assigned_time", length = 30)
    private String assignedTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "housekeeping_checklist", joinColumns = @JoinColumn(name = "task_id"))
    @Builder.Default
    private List<ChecklistItem> checklist = new ArrayList<>();

    public String getTaskCode() {
        return "HK" + String.format("%03d", id);
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChecklistItem {
        private String label;
        private boolean done;
    }
}
