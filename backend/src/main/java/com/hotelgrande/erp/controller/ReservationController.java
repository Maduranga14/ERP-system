package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.Reservation;
import com.hotelgrande.erp.repository.CustomerRepository;
import com.hotelgrande.erp.repository.ReservationRepository;
import com.hotelgrande.erp.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody java.util.Map<String, Object> body) {
        try {
            Long customerId = Long.valueOf(body.get("customerId").toString());
            Long roomId     = Long.valueOf(body.get("roomId").toString());

            com.hotelgrande.erp.entity.Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
            com.hotelgrande.erp.entity.Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

            String checkIn  = (String) body.getOrDefault("checkIn", "");
            String checkOut = (String) body.getOrDefault("checkOut", "");
            int nights = 0;
            try {
                java.time.LocalDate ci = java.time.LocalDate.parse(checkIn);
                java.time.LocalDate co = java.time.LocalDate.parse(checkOut);
                nights = (int) java.time.temporal.ChronoUnit.DAYS.between(ci, co);
            } catch (Exception ignored) {}

            double rate     = room.getPricePerNight() != null ? room.getPricePerNight() : 0;
            double charges  = rate * nights;
            double tax      = Math.round(charges * 0.12 * 100.0) / 100.0;
            double discount = body.get("discount") != null ? Double.parseDouble(body.get("discount").toString()) : 0;
            double total    = charges + tax - discount;

            Reservation res = Reservation.builder()
                    .bookedDate(java.time.LocalDate.now().toString())
                    .customer(customer)
                    .room(room)
                    .checkIn(checkIn)
                    .checkOut(checkOut)
                    .nights(nights)
                    .status((String) body.getOrDefault("status", "Confirmed"))
                    .payment((String) body.getOrDefault("payment", "Pending"))
                    .roomCharges(charges)
                    .additionalServices(0.0)
                    .tax(tax)
                    .discount(discount)
                    .discountCode((String) body.getOrDefault("discountCode", ""))
                    .total(total)
                    .specialRequests((String) body.getOrDefault("specialRequests", ""))
                    .build();

            return ResponseEntity.ok(reservationRepository.save(res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable Long id,
                                               @RequestBody java.util.Map<String, Object> body) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    try {
                        // ── Resolve Customer (optional override) ──────────────
                        if (body.get("customerId") != null) {
                            Long customerId = Long.valueOf(body.get("customerId").toString());
                            com.hotelgrande.erp.entity.Customer customer =
                                    customerRepository.findById(customerId)
                                            .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
                            reservation.setCustomer(customer);
                        }

                        // ── Resolve Room ──────────────────────────────────────
                        if (body.get("roomId") != null) {
                            Long roomId = Long.valueOf(body.get("roomId").toString());
                            com.hotelgrande.erp.entity.Room room =
                                    roomRepository.findById(roomId)
                                            .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
                            reservation.setRoom(room);
                        }

                        // ── Dates & auto-calculated nights ────────────────────
                        String checkIn  = body.containsKey("checkIn")  ? (String) body.get("checkIn")  : reservation.getCheckIn();
                        String checkOut = body.containsKey("checkOut") ? (String) body.get("checkOut") : reservation.getCheckOut();
                        reservation.setCheckIn(checkIn);
                        reservation.setCheckOut(checkOut);

                        int nights = reservation.getNights() != null ? reservation.getNights() : 0;
                        try {
                            java.time.LocalDate ci = java.time.LocalDate.parse(checkIn);
                            java.time.LocalDate co = java.time.LocalDate.parse(checkOut);
                            nights = (int) java.time.temporal.ChronoUnit.DAYS.between(ci, co);
                            if (nights < 0) nights = 0;
                        } catch (Exception ignored) {}
                        reservation.setNights(nights);

                        // ── Billing recalculation ─────────────────────────────
                        double rate     = reservation.getRoom() != null && reservation.getRoom().getPricePerNight() != null
                                          ? reservation.getRoom().getPricePerNight() : 0;
                        double charges  = rate * nights;
                        double additSvc = body.get("additionalServices") != null
                                          ? Double.parseDouble(body.get("additionalServices").toString()) : 0;
                        double tax      = Math.round(charges * 0.12 * 100.0) / 100.0;
                        double discount = body.get("discount") != null
                                          ? Double.parseDouble(body.get("discount").toString()) : 0;
                        double total    = charges + additSvc + tax - discount;

                        reservation.setRoomCharges(charges);
                        reservation.setAdditionalServices(additSvc);
                        reservation.setTax(tax);
                        reservation.setDiscount(discount);
                        reservation.setTotal(total);

                        // ── Other mutable fields ──────────────────────────────
                        if (body.containsKey("status"))
                            reservation.setStatus((String) body.get("status"));
                        if (body.containsKey("payment"))
                            reservation.setPayment((String) body.get("payment"));
                        if (body.containsKey("discountCode"))
                            reservation.setDiscountCode((String) body.get("discountCode"));
                        if (body.containsKey("specialRequests"))
                            reservation.setSpecialRequests((String) body.get("specialRequests"));

                        return (Object) ResponseEntity.ok(reservationRepository.save(reservation));
                    } catch (Exception e) {
                        return (Object) ResponseEntity.badRequest().body(e.getMessage());
                    }
                })
                .map(result -> (org.springframework.http.ResponseEntity<?>) result)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<Reservation> checkIn(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setStatus("Checked In");
                    if (reservation.getRoom() != null) {
                        reservation.getRoom().setStatus("Occupied");
                    }
                    return ResponseEntity.ok(reservationRepository.save(reservation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<Reservation> checkOut(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setStatus("Checked Out");
                    if (reservation.getRoom() != null) {
                        reservation.getRoom().setStatus("Cleaning");
                    }
                    return ResponseEntity.ok(reservationRepository.save(reservation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setStatus("Cancelled");
                    return ResponseEntity.ok(reservationRepository.save(reservation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservationRepository.delete(reservation);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
