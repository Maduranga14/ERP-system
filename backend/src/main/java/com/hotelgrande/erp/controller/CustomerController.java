package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.Customer;
import com.hotelgrande.erp.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin
public class CustomerController {

    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerRepository.findAllByOrderByIdDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer details) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customer.setName(details.getName());
                    customer.setMemberTier(details.getMemberTier());
                    customer.setEmail(details.getEmail());
                    customer.setPhone(details.getPhone());
                    customer.setCountry(details.getCountry());
                    customer.setNationalId(details.getNationalId());
                    customer.setDob(details.getDob());
                    customer.setAddress(details.getAddress());
                    customer.setStatus(details.getStatus());
                    customer.setJoinedDate(details.getJoinedDate());
                    customer.setPreferences(details.getPreferences());
                    return ResponseEntity.ok(customerRepository.save(customer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customerRepository.delete(customer);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
