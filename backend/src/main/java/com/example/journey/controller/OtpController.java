package com.example.journey.controller;

import com.example.journey.dto.OtpRequest;
import com.example.journey.dto.OtpResponse;
import com.example.journey.dto.OtpVerifyRequest;
import com.example.journey.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
public class OtpController {
    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/request")
    public ResponseEntity<OtpResponse> requestOtp(@RequestBody OtpRequest request) {
        OtpResponse resp = otpService.requestOtp(request);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyOtp(@RequestBody OtpVerifyRequest request) {
        boolean valid = otpService.verifyOtp(request);
        return ResponseEntity.ok(valid);
    }
}
