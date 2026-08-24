package com.example.journey.controller;

import com.example.journey.dto.LoginRequest;
import com.example.journey.dto.LoginResponse;
import com.example.journey.model.User;
import com.example.journey.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class TrustedDeviceController {

    private final AuthService authService;

    public TrustedDeviceController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a trusted device for the currently authenticated user.
     * The client must include a valid Bearer token.
     * Returns a raw device token (to be stored securely on the client, e.g., in a cookie).
     */
    @PostMapping("/trusted-device/register")
    public ResponseEntity<String> registerTrustedDevice(@RequestHeader("Authorization") String bearer) {
        String token = bearer.replace("Bearer ", "");
        User user = authService.validateToken(token);
        String deviceToken = authService.registerTrustedDevice(user);
        return ResponseEntity.ok(deviceToken);
    }

    /**
     * Exchange a trusted‑device token for a new auth session.
     * This endpoint does NOT require a Bearer token – the device token is enough.
     */
    @PostMapping("/trusted-device/login")
    public ResponseEntity<LoginResponse> loginWithTrustedDevice(@RequestBody String deviceToken) {
        LoginResponse resp = authService.loginWithTrustedDevice(deviceToken);
        return ResponseEntity.ok(resp);
    }
}
