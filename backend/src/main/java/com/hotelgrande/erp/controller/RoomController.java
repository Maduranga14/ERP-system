package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.Room;
import com.hotelgrande.erp.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> createRoom(@RequestBody Room room) {
        if (roomRepository.findByNumber(room.getNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Room number " + room.getNumber() + " already exists.");
        }
        if (room.getStatus() == null || room.getStatus().isBlank()) {
            room.setStatus("Available");
        }
        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(room -> {
                    roomRepository.delete(room);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
