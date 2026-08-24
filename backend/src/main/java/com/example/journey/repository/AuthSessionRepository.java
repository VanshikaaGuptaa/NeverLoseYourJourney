package com.example.journey.repository;

import com.example.journey.model.AuthSession;
import com.example.journey.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {
    Optional<AuthSession> findByToken(String token);
    void deleteByToken(String token);
    // find latest active session for a user (optional)
    Optional<AuthSession> findTopByUserAndRevokedFalseOrderByExpiresAtDesc(User user);
}
