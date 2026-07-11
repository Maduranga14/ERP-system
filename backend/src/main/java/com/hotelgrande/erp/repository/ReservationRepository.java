package com.hotelgrande.erp.repository;

import com.hotelgrande.erp.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.room.id = :roomId " +
           "AND r.status NOT IN ('Cancelled', 'Checked Out') " +
           "AND r.checkIn < :checkOut AND r.checkOut > :checkIn")
    List<Reservation> findOverlappingReservations(
            @Param("roomId") Long roomId,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut
    );

    @Query("SELECT r FROM Reservation r WHERE r.room.id = :roomId " +
           "AND r.id != :excludeId " +
           "AND r.status NOT IN ('Cancelled', 'Checked Out') " +
           "AND r.checkIn < :checkOut AND r.checkOut > :checkIn")
    List<Reservation> findOverlappingReservationsExcludeId(
            @Param("roomId") Long roomId,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut,
            @Param("excludeId") Long excludeId
    );

    List<Reservation> findAllByOrderByIdDesc();
}
