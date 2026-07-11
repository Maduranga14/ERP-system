package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.MaintenanceRequest;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.MaintenanceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<?> getAllRequests(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return ResponseEntity.ok(maintenanceRequestRepository.findAllByOrderByIdDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return maintenanceRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody MaintenanceRequest request, @AuthenticationPrincipal User currentUser) {
        // Receptionists cannot report maintenance (receptionist: ❌ for Report Maintenance)
        if (currentUser.getRole() == Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Receptionists cannot report maintenance issues.");
        }
        if (request.getStatus() == null) request.setStatus("Open");
        if (request.getPriority() == null) request.setPriority("Medium");
        if (request.getRoom() != null && request.getRoom().getNumber() != null) {
            roomRepository.findByNumber(request.getRoom().getNumber())
                    .ifPresent(request::setRoom);
        }
        return ResponseEntity.ok(maintenanceRequestRepository.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(
            @PathVariable Long id,
            @RequestBody MaintenanceRequest details,
            @AuthenticationPrincipal User currentUser) {
        // Receptionists cannot edit maintenance
        if (currentUser.getRole() == Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
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
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return maintenanceRequestRepository.findById(id)
                .map(request -> {
                    request.setStatus(status);
                    return ResponseEntity.ok(maintenanceRequestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return maintenanceRequestRepository.findById(id)
                .map(request -> {
                    maintenanceRequestRepository.delete(request);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
