package com.example.journey.controller;

import com.example.journey.dto.LoginResponse;
import com.example.journey.dto.WebAuthnChallengeResponse;
import com.example.journey.dto.WebAuthnRegisterRequest;
import com.example.journey.dto.WebAuthnVerifyRequest;
import com.example.journey.model.User;
import com.example.journey.service.AuthService;
import com.example.journey.service.WebAuthnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/webauthn")
public class WebAuthnController {
    private final WebAuthnService webAuthnService;
    private final AuthService authService;

    public WebAuthnController(WebAuthnService webAuthnService, AuthService authService) {
        this.webAuthnService = webAuthnService;
        this.authService = authService;
    }

    @GetMapping("/challenge")
    public ResponseEntity<WebAuthnChallengeResponse> getChallenge() {
        return ResponseEntity.ok(new WebAuthnChallengeResponse(webAuthnService.generateChallenge()));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestHeader("Authorization") String bearer, @RequestBody WebAuthnRegisterRequest request) {
        try {
            String token = bearer.startsWith("Bearer ") ? bearer.substring(7) : bearer;
            User user = authService.validateToken(token);
            webAuthnService.registerCredential(user, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<LoginResponse> verify(@RequestBody WebAuthnVerifyRequest request) {
        try {
            LoginResponse resp = webAuthnService.verifyAndCreateSession(request);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return ResponseEntity.status(401).build();
        }
    }
}
