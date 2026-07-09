package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.Room;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin
public class RoomController {

    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators and managers can create rooms.");
        }
        if (roomRepository.findByNumber(room.getNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Room number " + room.getNumber() + " already exists.");
        }
        if (room.getStatus() == null || room.getStatus().isBlank()) {
            room.setStatus("Available");
        }
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(
            @PathVariable Long id,
            @RequestBody Room roomDetails,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators and managers can edit rooms.");
        }
        return roomRepository.findById(id)
                .map(room -> {
                    room.setNumber(roomDetails.getNumber());
                    room.setType(roomDetails.getType());
                    room.setFloor(roomDetails.getFloor());
                    room.setCapacity(roomDetails.getCapacity());
                    room.setPricePerNight(roomDetails.getPricePerNight());
                    room.setBedType(roomDetails.getBedType());
                    room.setStatus(roomDetails.getStatus());
                    room.setLastCleaned(roomDetails.getLastCleaned());
                    room.setViewType(roomDetails.getViewType());
                    room.setWing(roomDetails.getWing());
                    room.setDescription(roomDetails.getDescription());
                    room.getAmenities().clear();
                    if (roomDetails.getAmenities() != null) {
                        room.getAmenities().addAll(roomDetails.getAmenities());
                    }
                    return ResponseEntity.ok(roomRepository.save(room));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Receptionists cannot change room status directly.");
        }
        return roomRepository.findById(id)
                .map(room -> {
                    room.setStatus(status);
                    return ResponseEntity.ok(roomRepository.save(room));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators and managers can delete rooms.");
        }
        return roomRepository.findById(id)
                .map(room -> {
                    roomRepository.delete(room);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
