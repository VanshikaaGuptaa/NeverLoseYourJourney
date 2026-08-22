package com.example.journey.controller;

import com.example.journey.dto.SubmissionRequest;
import com.example.journey.model.Submission;
import com.example.journey.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submission")
public class SubmissionController {
    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<Submission> submit(
            @RequestHeader("Authorization") String bearer,
            @RequestBody SubmissionRequest request) {
        try {
            String token = bearer.replace("Bearer ", "");
            Submission sub = submissionService.submit(token, request);
            return ResponseEntity.ok(sub);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("network failure")) {
                return ResponseEntity.status(503).build();
            }
            return ResponseEntity.status(401).build();
        }
    }
}
