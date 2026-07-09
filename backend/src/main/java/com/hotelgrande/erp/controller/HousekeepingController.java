package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.HousekeepingTask;
import com.hotelgrande.erp.repository.HousekeepingTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/housekeeping")
@RequiredArgsConstructor
@CrossOrigin
public class HousekeepingController {

    private final HousekeepingTaskRepository housekeepingTaskRepository;

    @GetMapping
    public ResponseEntity<List<HousekeepingTask>> getAllTasks() {
        return ResponseEntity.ok(housekeepingTaskRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HousekeepingTask> getTaskById(@PathVariable Long id) {
        return housekeepingTaskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HousekeepingTask> createTask(@RequestBody HousekeepingTask task) {
        if (task.getStatus() == null) task.setStatus("Pending");
        if (task.getPriority() == null) task.setPriority("Medium");
        return ResponseEntity.ok(housekeepingTaskRepository.save(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HousekeepingTask> updateTask(@PathVariable Long id, @RequestBody HousekeepingTask details) {
        return housekeepingTaskRepository.findById(id)
                .map(task -> {
                    task.setRoom(details.getRoom());
                    task.setHousekeeper(details.getHousekeeper());
                    task.setPriority(details.getPriority());
                    task.setStatus(details.getStatus());
                    task.setDueTime(details.getDueTime());
                    task.setAssignedTime(details.getAssignedTime());
                    task.setNotes(details.getNotes());
                    task.setChecklist(details.getChecklist());
                    return ResponseEntity.ok(housekeepingTaskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HousekeepingTask> updateStatus(@PathVariable Long id, @RequestParam String status) {
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
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        return housekeepingTaskRepository.findById(id)
                .map(task -> {
                    housekeepingTaskRepository.delete(task);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
