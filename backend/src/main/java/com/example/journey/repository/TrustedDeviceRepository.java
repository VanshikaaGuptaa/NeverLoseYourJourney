package com.example.journey.repository;

import com.example.journey.model.TrustedDevice;
import com.example.journey.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Long> {
    Optional<TrustedDevice> findByTokenHash(String tokenHash);
    Optional<TrustedDevice> findByUserAndTokenHash(User user, String tokenHash);
    void deleteByTokenHash(String tokenHash);
    Optional<TrustedDevice> findTopByUserAndRevokedFalseOrderByExpiresAtDesc(User user);
}
