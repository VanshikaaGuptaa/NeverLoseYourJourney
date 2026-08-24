package com.example.journey.service;

import com.example.journey.dto.OtpRequest;
import com.example.journey.dto.OtpResponse;
import com.example.journey.dto.OtpVerifyRequest;
import com.example.journey.config.SimulationConfig;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in‑memory OTP service.
 * Generates a numeric code, stores it with expiry, and validates.
 * Supports delayed delivery via SimulationConfig.
 */
@Service
public class OtpService {
    private final SimulationConfig simulationConfig;
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public OtpService(SimulationConfig simulationConfig) {
        this.simulationConfig = simulationConfig;
    }

    private record OtpEntry(String code, Instant expiresAt) {}

    public OtpResponse requestOtp(OtpRequest req) {
        // Simulate optional delay for delivery
        long delay = simulationConfig.otpDelayMillis > 0 ? simulationConfig.otpDelayMillis : 0L;
        if (delay > 0) {
            try { Thread.sleep(delay); } catch (InterruptedException ignored) {}
            simulationConfig.otpDelayMillis = 0L; // one‑off
        }
        String code = String.format("%06d", random.nextInt(1_000_000));
        Instant expires = Instant.now().plusSeconds(300); // 5 minutes default
        otpStore.put(req.mobile(), new OtpEntry(code, expires));
        
        // Log to console for demo purposes so the user knows what to type
        System.out.println("\n=========================================");
        System.out.println("🚀 DEMO OTP for " + req.mobile() + ": " + code);
        System.out.println("=========================================\n");
        
        // In real system we would send the code via SMS provider.
        return new OtpResponse(req.mobile(), "SENT", expires.toEpochMilli(), code);
    }

    public boolean verifyOtp(OtpVerifyRequest req) {
        OtpEntry entry = otpStore.get(req.mobile());
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(req.mobile());
            return false;
        }
        boolean match = entry.code().equals(req.code());
        if (match) {
            otpStore.remove(req.mobile());
        }
        return match;
    }
}
