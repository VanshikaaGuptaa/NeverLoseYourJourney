package com.example.journey.controller;

import com.example.journey.dto.LoginRequest;
import com.example.journey.dto.LoginResponse;
import com.example.journey.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse resp = authService.login(request);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("OTP_REQUIRED:")) {
                String code = e.getMessage().split(":")[1];
                return ResponseEntity.status(202).header("X-Demo-OTP", code).build();
            }
            if ("OTP_REQUIRED".equals(e.getMessage())) {
                return ResponseEntity.status(202).build();
            }
            throw e;
        }
    }

    @PostMapping("/otp-login")
    public ResponseEntity<LoginResponse> otpLogin(@RequestBody com.example.journey.dto.OtpVerifyRequest request) {
        try {
            LoginResponse resp = authService.loginWithOtp(request.mobile());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    // Endpoint for the front‑end to check token health (optional)
    @GetMapping("/validate")
    public ResponseEntity<Void> validate(@RequestHeader("Authorization") String bearer) {
        try {
            String token = bearer.startsWith("Bearer ") ? bearer.substring(7) : bearer;
            authService.validateToken(token);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
