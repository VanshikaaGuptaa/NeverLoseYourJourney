package com.example.journey.dto;

public record WebAuthnVerifyRequest(String credentialId, String clientDataJSON, String authenticatorData, String signature, String email) {}
