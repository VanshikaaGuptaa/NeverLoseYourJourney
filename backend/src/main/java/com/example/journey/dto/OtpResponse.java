package com.example.journey.dto;

public record OtpResponse(String mobile, String status, long expiresAtEpochMillis, String code) {}
