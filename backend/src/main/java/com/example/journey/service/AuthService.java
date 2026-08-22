package com.example.journey.service;

import com.example.journey.dto.LoginRequest;
import com.example.journey.dto.LoginResponse;
import com.example.journey.model.User;
import com.example.journey.repository.UserRepository;
import com.example.journey.config.SimulationConfig;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple mock authentication service.
 * Generates a UUID token and keeps an in‑memory map of token → user + expiry.
 * Supports forced expiry via SimulationConfig.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final SimulationConfig simulationConfig;
    private final Map<String, SessionInfo> tokenStore = new ConcurrentHashMap<>();
    private static final long DEFAULT_TTL_SECONDS = 900; // 15 minutes

    public AuthService(UserRepository userRepository, SimulationConfig simulationConfig) {
        this.userRepository = userRepository;
        this.simulationConfig = simulationConfig;
    }

    public record SessionInfo(User user, Instant expiresAt) {}

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.email());
                    newUser.setName("Demo User");
                    newUser.setMobile("9999999999");
                    newUser.setPasswordHash("mock-hash");
                    return userRepository.save(newUser);
                });
        // In a real system, verify password hash – here we skip it.
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusSeconds(DEFAULT_TTL_SECONDS);
        tokenStore.put(token, new SessionInfo(user, expiry));
        return new LoginResponse(token, DEFAULT_TTL_SECONDS);
    }

    /**
     * Validate token and optionally trigger forced expiry.
     */
    public User validateToken(String token) {
        if (simulationConfig.expireAuthSession) {
            // Simulate immediate expiry for next request.
            simulationConfig.expireAuthSession = false;
            tokenStore.remove(token);
            throw new RuntimeException("Session expired (simulated)");
        }
        SessionInfo info = tokenStore.get(token);
        if (info == null) {
            throw new RuntimeException("Invalid or missing token");
        }
        if (Instant.now().isAfter(info.expiresAt)) {
            tokenStore.remove(token);
            throw new RuntimeException("Session expired");
        }
        return info.user();
    }

    // Helper to reset token store (useful for demo reset)
    public void clearAllSessions() {
        tokenStore.clear();
    }
}
