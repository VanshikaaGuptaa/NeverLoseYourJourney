package com.example.journey.service;

import com.example.journey.dto.SubmissionRequest;
import com.example.journey.model.Journey;
import com.example.journey.model.Submission;
import com.example.journey.repository.JourneyRepository;
import com.example.journey.repository.SubmissionRepository;
import com.example.journey.service.AuthService;
import com.example.journey.config.SimulationConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Handles idempotent submission of a journey.
 * If a submission with the same transactionId or idempotencyKey already exists, returns its status.
 */
@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final JourneyRepository journeyRepository;
    private final AuthService authService;
    private final SimulationConfig simulationConfig;

    public SubmissionService(SubmissionRepository submissionRepository, JourneyRepository journeyRepository,
                             AuthService authService, SimulationConfig simulationConfig) {
        this.submissionRepository = submissionRepository;
        this.journeyRepository = journeyRepository;
        this.authService = authService;
        this.simulationConfig = simulationConfig;
    }

    @Transactional
    public Submission submit(String token, SubmissionRequest req) {
        // Simulate network failure
        if (simulationConfig.forceNetworkFailure) {
            simulationConfig.forceNetworkFailure = false;
            throw new RuntimeException("Simulated network failure during submission");
        }
        // Simulate delayed response
        if (simulationConfig.delayResponseMillis > 0) {
            try { Thread.sleep(simulationConfig.delayResponseMillis); } catch (InterruptedException ignored) {}
            simulationConfig.delayResponseMillis = 0L;
        }
        // Validate token
        var user = authService.validateToken(token);

        // Load journey
        Journey journey = journeyRepository.findById(req.journeyId())
                .orElseThrow(() -> new IllegalArgumentException("Journey not found"));
        if (!journey.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to journey");
        }

        // Check for existing submission by transactionId or idempotencyKey
        Optional<Submission> existing = submissionRepository.findByTransactionId(req.transactionId());
        if (existing.isEmpty() && req.idempotencyKey() != null) {
            existing = submissionRepository.findByIdempotencyKey(req.idempotencyKey());
        }
        if (existing.isPresent()) {
            // Idempotent – return existing submission (status may be SUCCESS or PROCESSING)
            return existing.get();
        }

        // Create new submission record with PROCESSING status
        Submission submission = new Submission();
        submission.setJourney(journey);
        submission.setTransactionId(req.transactionId());
        submission.setIdempotencyKey(req.idempotencyKey());
        submission.setStatus("PROCESSING");
        submission.setSubmittedAt(Instant.now());
        Submission saved = submissionRepository.save(submission);

        // Simulate processing (in real system this would be async)
        // For demo we instantly mark SUCCESS unless a simulated failure was triggered above.
        saved.setStatus("SUCCESS");
        return submissionRepository.save(saved);
    }
}
