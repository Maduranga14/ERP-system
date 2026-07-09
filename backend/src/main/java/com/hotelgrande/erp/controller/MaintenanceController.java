package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.MaintenanceRequest;
import com.hotelgrande.erp.repository.MaintenanceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin
public class MaintenanceController {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final com.hotelgrande.erp.repository.RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests() {
        return ResponseEntity.ok(maintenanceRequestRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> getRequestById(@PathVariable Long id) {
        return maintenanceRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequest> createRequest(@RequestBody MaintenanceRequest request) {
        if (request.getStatus() == null) request.setStatus("Open");
        if (request.getPriority() == null) request.setPriority("Medium");
        if (request.getRoom() != null && request.getRoom().getNumber() != null) {
            roomRepository.findByNumber(request.getRoom().getNumber())
                    .ifPresent(request::setRoom);
        }
        return ResponseEntity.ok(maintenanceRequestRepository.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> updateRequest(@PathVariable Long id, @RequestBody MaintenanceRequest details) {
        return maintenanceRequestRepository.findById(id)
                .map(request -> {
                    request.setRoom(details.getRoom());
                    request.setCategory(details.getCategory());
                    request.setPriority(details.getPriority());
                    request.setStatus(details.getStatus());
                    request.setDescription(details.getDescription());
                    request.setReportedBy(details.getReportedBy());
                    request.setReportedDate(details.getReportedDate());
                    request.setReportedTime(details.getReportedTime());
                    request.setAssignedTo(details.getAssignedTo());
                    request.setResolvedDate(details.getResolvedDate());
                    request.setResolutionNotes(details.getResolutionNotes());
                    return ResponseEntity.ok(maintenanceRequestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MaintenanceRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return maintenanceRequestRepository.findById(id)
                .map(request -> {
                    request.setStatus(status);
                    return ResponseEntity.ok(maintenanceRequestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        return maintenanceRequestRepository.findById(id)
                .map(request -> {
                    maintenanceRequestRepository.delete(request);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
