package com.example.journey.dto;

public record SubmissionRequest(Long journeyId, String transactionId, String idempotencyKey) {}
