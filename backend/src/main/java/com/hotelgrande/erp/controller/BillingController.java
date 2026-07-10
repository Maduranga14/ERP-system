package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.Invoice;
import com.hotelgrande.erp.entity.InvoicePayment;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin
public class BillingController {

    private final InvoiceRepository invoiceRepository;

    @GetMapping
    public ResponseEntity<?> getAllInvoices(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER && currentUser.getRole() != Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return ResponseEntity.ok(invoiceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER && currentUser.getRole() != Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@RequestBody Invoice invoice, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        if (invoice.getLineItems() != null) {
            invoice.getLineItems().forEach(item -> item.setInvoice(invoice));
        }
        if (invoice.getPayments() != null) {
            invoice.getPayments().forEach(payment -> payment.setInvoice(invoice));
        }
        return ResponseEntity.ok(invoiceRepository.save(invoice));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice details,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setGuestName(details.getGuestName());
                    invoice.setEmail(details.getEmail());
                    invoice.setPhone(details.getPhone());
                    invoice.setReservation(details.getReservation());
                    invoice.setCheckIn(details.getCheckIn());
                    invoice.setCheckOut(details.getCheckOut());
                    invoice.setNights(details.getNights());
                    invoice.setRoomNumber(details.getRoomNumber());
                    invoice.setRoomType(details.getRoomType());
                    invoice.setMethod(details.getMethod());
                    invoice.setStatus(details.getStatus());
                    invoice.setDate(details.getDate());
                    invoice.setSubtotal(details.getSubtotal());
                    invoice.setTax(details.getTax());
                    invoice.setDiscount(details.getDiscount());
                    invoice.setGrandTotal(details.getGrandTotal());
                    invoice.setAmountPaid(details.getAmountPaid());
                    invoice.setNotes(details.getNotes());

                    invoice.getLineItems().clear();
                    if (details.getLineItems() != null) {
                        details.getLineItems().forEach(item -> {
                            item.setInvoice(invoice);
                            invoice.getLineItems().add(item);
                        });
                    }

                    invoice.getPayments().clear();
                    if (details.getPayments() != null) {
                        details.getPayments().forEach(payment -> {
                            payment.setInvoice(invoice);
                            invoice.getPayments().add(payment);
                        });
                    }

                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<?> addPayment(
            @PathVariable Long id,
            @RequestBody InvoicePayment payment,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.RECEPTIONIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    payment.setInvoice(invoice);
                    invoice.getPayments().add(payment);
                    invoice.setAmountPaid(invoice.getAmountPaid() + payment.getAmount());
                    if (invoice.getAmountPaid() >= invoice.getGrandTotal()) {
                        invoice.setStatus("Paid");
                        if (invoice.getReservation() != null) {
                            invoice.getReservation().setPayment("Paid");
                        }
                    } else if (invoice.getAmountPaid() > 0) {
                        invoice.setStatus("Partial");
                        if (invoice.getReservation() != null) {
                            invoice.getReservation().setPayment("Partial");
                        }
                    }
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoiceRepository.delete(invoice);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
