package com.hotelgrande.erp.repository;

import com.hotelgrande.erp.entity.HousekeepingTask;
import com.hotelgrande.erp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    List<HousekeepingTask> findByHousekeeper(User housekeeper);
    List<HousekeepingTask> findAllByOrderByIdDesc();
}
