package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.HousekeepingTask;
import com.hotelgrande.erp.entity.MaintenanceRequest;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.HousekeepingTaskRepository;
import com.hotelgrande.erp.repository.MaintenanceRequestRepository;
import com.hotelgrande.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/housekeeping")
@RequiredArgsConstructor
@CrossOrigin
public class HousekeepingController {

    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllTasks(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return ResponseEntity.ok(housekeepingTaskRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return housekeepingTaskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody HousekeepingTask task, @AuthenticationPrincipal User currentUser) {

        if (currentUser.getRole() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        if (task.getStatus() == null) task.setStatus("Pending");
        if (task.getPriority() == null) task.setPriority("Medium");
        return ResponseEntity.ok(housekeepingTaskRepository.save(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody HousekeepingTask details,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }

        return housekeepingTaskRepository.findById(id)
                .map(task -> {

                    if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.MANAGER) {
                        task.setRoom(details.getRoom());
                        task.setHousekeeper(details.getHousekeeper());
                        task.setPriority(details.getPriority());
                        task.setDueTime(details.getDueTime());
                        task.setAssignedTime(details.getAssignedTime());
                    }


                    task.setStatus(details.getStatus());
                    task.setNotes(details.getNotes());
                    task.getChecklist().clear();
                    if (details.getChecklist() != null) {
                        task.getChecklist().addAll(details.getChecklist());
                    }


                    if ("Completed".equalsIgnoreCase(details.getStatus()) && task.getRoom() != null) {
                        task.getRoom().setStatus("Available");
                    }

                    return ResponseEntity.ok(housekeepingTaskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getRole() == Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Receptionists cannot update cleaning status.");
        }
        return housekeepingTaskRepository.findById(id)
                .map(task -> {
                    task.setStatus(status);
                    if ("Completed".equalsIgnoreCase(status) && task.getRoom() != null) {
                        task.getRoom().setStatus("Available");
                    }
                    return ResponseEntity.ok(housekeepingTaskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Assigns an Open maintenance request as a housekeeping task.
     * Body: { maintenanceRequestId, staffId, priority, dueTime, notes, checklist }
     * Only ADMIN and MANAGER can call this.
     */
    @PostMapping("/assign-maintenance")
    public ResponseEntity<?> assignMaintenanceTask(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admin and Manager can assign maintenance tasks.");
        }

        Long maintenanceId = Long.valueOf(body.get("maintenanceRequestId").toString());
        MaintenanceRequest maintenance = maintenanceRequestRepository.findById(maintenanceId)
                .orElse(null);
        if (maintenance == null) {
            return ResponseEntity.badRequest().body("Maintenance request not found.");
        }
        if (!"Open".equalsIgnoreCase(maintenance.getStatus())) {
            return ResponseEntity.badRequest().body("Only Open maintenance requests can be assigned.");
        }

        // Resolve housekeeper
        User housekeeper = null;
        if (body.get("staffId") != null && !body.get("staffId").toString().isBlank()) {
            housekeeper = userRepository.findById(Long.valueOf(body.get("staffId").toString())).orElse(null);
        }

        // Build checklist
        List<HousekeepingTask.ChecklistItem> checklist = new java.util.ArrayList<>();
        Object rawChecklist = body.get("checklist");
        if (rawChecklist instanceof List<?> items) {
            for (Object item : items) {
                if (item instanceof String s) {
                    checklist.add(new HousekeepingTask.ChecklistItem(s, false));
                } else if (item instanceof Map<?,?> m) {
                    String label = m.get("label") != null ? m.get("label").toString() : "";
                    boolean done = m.get("done") != null && Boolean.parseBoolean(m.get("done").toString());
                    checklist.add(new HousekeepingTask.ChecklistItem(label, done));
                }
            }
        }

        HousekeepingTask task = HousekeepingTask.builder()
                .room(maintenance.getRoom())
                .housekeeper(housekeeper)
                .priority(body.getOrDefault("priority", "Medium").toString())
                .status("Pending")
                .dueTime(body.getOrDefault("dueTime", "").toString())
                .assignedTime(new java.text.SimpleDateFormat("HH:mm").format(new java.util.Date()))
                .notes(body.getOrDefault("notes", maintenance.getDescription()).toString())
                .checklist(checklist)
                .build();

        HousekeepingTask saved = housekeepingTaskRepository.save(task);

        // Mark the maintenance request as In Progress
        maintenance.setStatus("In Progress");
        maintenanceRequestRepository.save(maintenance);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return housekeepingTaskRepository.findById(id)
                .map(task -> {
                    housekeepingTaskRepository.delete(task);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
