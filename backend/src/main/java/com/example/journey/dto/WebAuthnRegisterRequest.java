package com.example.journey.dto;

public record WebAuthnRegisterRequest(String credentialId, String publicKey, String clientDataJSON) {}
