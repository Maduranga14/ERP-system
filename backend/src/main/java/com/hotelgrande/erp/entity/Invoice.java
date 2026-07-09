package com.hotelgrande.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(name = "check_in", length = 30)
    private String checkIn;

    @Column(name = "check_out", length = 30)
    private String checkOut;

    private Integer nights;

    @Column(name = "room_number", length = 10)
    private String roomNumber;

    @Column(name = "room_type", length = 50)
    private String roomType;

    @Column(length = 30)
    private String method; // Card, Online, Cash

    @Column(nullable = false, length = 30)
    private String status; // Paid, Pending, Partial, Refunded, Overdue

    @Column(length = 30)
    private String date; // date of invoice issue

    private Double subtotal;
    private Double tax;
    private Double discount;

    @Column(name = "grand_total")
    private Double grandTotal;

    @Column(name = "amount_paid")
    private Double amountPaid;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<InvoicePayment> payments = new ArrayList<>();

    public String getInvoiceCode() {
        return "INV-" + String.format("%03d", id);
    }
}
