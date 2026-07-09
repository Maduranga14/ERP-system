package com.hotelgrande.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "member_tier", length = 50)
    private String memberTier; // Regular Member, VIP Guest, Business Traveler, Platinum Member

    @Column(unique = true, length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 50)
    private String country;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(length = 50)
    private String dob;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 20)
    private String status; // Active, Inactive, New

    @Column(name = "joined_date", length = 30)
    private String joinedDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "customer_preferences", joinColumns = @JoinColumn(name = "customer_id"))
    @Column(name = "preference")
    @Builder.Default
    private List<String> preferences = new ArrayList<>();
}
