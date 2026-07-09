package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.HousekeepingTask;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.HousekeepingTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/housekeeping")
@RequiredArgsConstructor
@CrossOrigin
public class HousekeepingController {

    private final HousekeepingTaskRepository housekeepingTaskRepository;

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
