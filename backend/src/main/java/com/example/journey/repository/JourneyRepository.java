package com.example.journey.repository;

import com.example.journey.model.Journey;
import com.example.journey.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {
    Optional<Journey> findByUserAndId(User user, Long id);
    Optional<Journey> findTopByUserOrderByUpdatedAtDesc(User user);
}
