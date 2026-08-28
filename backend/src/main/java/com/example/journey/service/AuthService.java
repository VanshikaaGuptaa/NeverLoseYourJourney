package com.example.journey.service;

import com.example.journey.dto.LoginRequest;
import com.example.journey.dto.LoginResponse;
import com.example.journey.model.AuthSession;
import com.example.journey.model.TrustedDevice;
import com.example.journey.model.User;
import com.example.journey.repository.AuthSessionRepository;
import com.example.journey.repository.TrustedDeviceRepository;
import com.example.journey.repository.UserRepository;
import com.example.journey.config.SimulationConfig;
import com.example.journey.service.OtpService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentication service supporting password login, OTP verification and trusted‑device shortcuts.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final AuthSessionRepository authSessionRepository;
    private final TrustedDeviceRepository trustedDeviceRepository;
    private final OtpService otpService;
    private final SimulationConfig simulationConfig;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final long DEFAULT_TTL_SECONDS = 900; // 15 minutes
    // mobile -> userId for pending OTP verification
    private final ConcurrentHashMap<String, Long> pendingOtpMap = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository,
                       AuthSessionRepository authSessionRepository,
                       TrustedDeviceRepository trustedDeviceRepository,
                       OtpService otpService,
                       SimulationConfig simulationConfig) {
        this.userRepository = userRepository;
        this.authSessionRepository = authSessionRepository;
        this.trustedDeviceRepository = trustedDeviceRepository;
        this.otpService = otpService;
        this.simulationConfig = simulationConfig;
    }

    /**
     * Primary login endpoint. Returns a session token if authentication succeeds.
     * If OTP is required, throws RuntimeException with message "OTP_REQUIRED".
     */
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.email());
                    newUser.setName("Demo User");
                    newUser.setMobile("9999999999");
                    String rawPass = request.password() != null ? request.password() : "defaultPass";
                    newUser.setPasswordHash(passwordEncoder.encode(rawPass));
                    return userRepository.save(newUser);
                });
        // Verify password for existing users
        if (request.password() != null && !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        // 5-Minute Grace Period / Smart Auth -> Trigger Passkey
        if (hasTrustedDevice(user, request.deviceToken())) {
            throw new RuntimeException("WEBAUTHN_REQUIRED");
        }

        // Always initiate OTP/WebAuthn flow if no grace period
        pendingOtpMap.put(user.getMobile(), user.getId());
        com.example.journey.dto.OtpResponse otpRes = otpService.requestOtp(new com.example.journey.dto.OtpRequest(user.getMobile()));
        throw new RuntimeException("OTP_REQUIRED:" + otpRes.code());
    }

    /**
     * Complete login after OTP verification.
     */
    public LoginResponse loginWithOtp(String mobile) {
        Long userId = pendingOtpMap.remove(mobile);
        if (userId == null) {
            throw new IllegalArgumentException("No pending OTP for this mobile");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return createSession(user);
    }

    /**
     * Register a trusted device for a user. Returns the raw token for client storage.
     */
    public String registerTrustedDevice(User user) {
        String token = UUID.randomUUID().toString();
        String hash = hashToken(token);
        TrustedDevice device = new TrustedDevice();
        device.setUser(user);
        device.setTokenHash(hash);
        Instant now = Instant.now();
        device.setCreatedAt(now);
        device.setLastUsedAt(now);
        device.setExpiresAt(now.plusSeconds(300)); // 5 mins grace period
        device.setRevoked(false);
        trustedDeviceRepository.save(device);
        return token;
    }

    /**
     * Login using a trusted‑device token (bypasses password/OTP).
     */
    public LoginResponse loginWithTrustedDevice(String deviceToken) {
        String hash = hashToken(deviceToken);
        TrustedDevice device = trustedDeviceRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid trusted device token"));
        if (device.isRevoked() || Instant.now().isAfter(device.getExpiresAt())) {
            throw new IllegalArgumentException("Trusted device token expired or revoked");
        }
        // Refresh usage timestamps
        device.setLastUsedAt(Instant.now());
        device.setExpiresAt(Instant.now().plusSeconds(300));
        trustedDeviceRepository.save(device);
        return createSession(device.getUser());
    }

    // Helper to create a session and return the response
    private LoginResponse createSession(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusSeconds(DEFAULT_TTL_SECONDS);
        AuthSession session = new AuthSession();
        session.setToken(token);
        session.setUser(user);
        session.setCreatedAt(Instant.now());
        session.setExpiresAt(expiry);
        session.setRevoked(false);
        authSessionRepository.save(session);
        return new LoginResponse(token, DEFAULT_TTL_SECONDS);
    }

    // Check for an existing valid trusted device using the token provided by the client
    private boolean hasTrustedDevice(User user, String deviceToken) {
        if (deviceToken == null || deviceToken.isBlank()) {
            return false;
        }
        String hash = hashToken(deviceToken);
        return trustedDeviceRepository.findByUserAndTokenHash(user, hash)
                .filter(d -> !d.isRevoked() && Instant.now().isBefore(d.getExpiresAt()))
                .isPresent();
    }

    // Hash token using SHA‑256 (hex)
    private String hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Validate token and optionally trigger forced expiry.
     */
    public User validateToken(String token) {
        if (simulationConfig.expireAuthSession) {
            simulationConfig.expireAuthSession = false;
            authSessionRepository.findByToken(token).ifPresent(s -> {
                s.setRevoked(true);
                authSessionRepository.save(s);
            });
            throw new RuntimeException("Session expired (simulated)");
        }
        AuthSession session = authSessionRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or missing token"));
        if (session.isRevoked() || Instant.now().isAfter(session.getExpiresAt())) {
            if (!session.isRevoked()) {
                session.setRevoked(true);
                authSessionRepository.save(session);
            }
            throw new RuntimeException("Session expired");
        }
        return session.getUser();
    }

    // Helper to reset token store (demo use)
    public void clearAllSessions() {
        authSessionRepository.deleteAll();
    }
}
