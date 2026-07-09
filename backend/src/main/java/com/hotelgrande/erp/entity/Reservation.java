package com.hotelgrande.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booked_date", length = 30)
    private String bookedDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "check_in", length = 30)
    private String checkIn;

    @Column(name = "check_out", length = 30)
    private String checkOut;

    private Integer nights;

    @Column(nullable = false, length = 30)
    private String status; // Confirmed, Checked In, Checked Out, Pending, Cancelled

    @Column(length = 30)
    private String payment; // Paid, Partial, Pending

    @Column(name = "room_charges")
    private Double roomCharges;

    @Column(name = "additional_services")
    private Double additionalServices;

    private Double tax;

    private Double discount;

    @Column(name = "discount_code", length = 50)
    private String discountCode;

    private Double total;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    public String getReservationCode() {
        return "RES-" + (10000 + id);
    }
}
