package com.hotelgrande.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String number;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false)
    private Integer floor;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    @Column(name = "bed_type", length = 50)
    private String bedType;

    @Column(nullable = false, length = 30)
    private String status; // Available, Occupied, Reserved, Cleaning, Maintenance, Down

    @Column(name = "last_cleaned", length = 50)
    private String lastCleaned;

    @Column(name = "view_type", length = 50)
    private String viewType;

    @Column(length = 50)
    private String wing;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();
}
