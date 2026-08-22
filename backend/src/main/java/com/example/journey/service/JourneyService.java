package com.example.journey.service;

import com.example.journey.dto.JourneySaveRequest;
import com.example.journey.dto.JourneySaveResponse;
import com.example.journey.model.Journey;
import com.example.journey.model.User;
import com.example.journey.repository.JourneyRepository;
import com.example.journey.config.SimulationConfig;
import com.example.journey.service.AuthService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;

@Service
public class JourneyService {
    private final JourneyRepository journeyRepository;
    private final AuthService authService;
    private final SimulationConfig simulationConfig;

    public JourneyService(JourneyRepository journeyRepository, AuthService authService, SimulationConfig simulationConfig) {
        this.journeyRepository = journeyRepository;
        this.authService = authService;
        this.simulationConfig = simulationConfig;
    }

    /**
     * Save or update a journey draft.
     */
    @Transactional
    public JourneySaveResponse saveJourney(String token, JourneySaveRequest request) {
        // Simulate optional delay
        if (simulationConfig.delayResponseMillis > 0) {
            try { Thread.sleep(simulationConfig.delayResponseMillis); } catch (InterruptedException ignored) {}
            simulationConfig.delayResponseMillis = 0L; // one‑off
        }
        // Simulate network failure
        if (simulationConfig.forceNetworkFailure) {
            simulationConfig.forceNetworkFailure = false;
            throw new RuntimeException("Simulated network failure (503)");
        }
        // Simulate autosave failure
        if (simulationConfig.failNextAutosave) {
            simulationConfig.failNextAutosave = false;
            throw new RuntimeException("Simulated autosave failure");
        }

        User user = authService.validateToken(token);
        // Find existing draft for this user (latest)
        Optional<Journey> existingOpt = journeyRepository.findTopByUserOrderByUpdatedAtDesc(user);
        Journey journey = existingOpt.map(j -> {
            j.setCurrentStep(request.currentStep());
            j.setFormDataJson(request.formDataJson());
            j.setUpdatedAt(Instant.now());
            j.setVersion(j.getVersion() + 1);
            return j;
        }).orElseGet(() -> {
            Journey j = new Journey();
            j.setUser(user);
            j.setCurrentStep(request.currentStep());
            j.setFormDataJson(request.formDataJson());
            j.setCreatedAt(Instant.now());
            j.setUpdatedAt(Instant.now());
            j.setVersion(0L);
            return j;
        });
        Journey saved = journeyRepository.save(journey);
        return new JourneySaveResponse(saved.getId(), "SAVED");
    }

    /**
     * Load the latest journey draft for the authenticated user.
     */
    @Transactional(readOnly = true)
    public Optional<Journey> loadLatest(String token) {
        User user = authService.validateToken(token);
        return journeyRepository.findTopByUserOrderByUpdatedAtDesc(user);
    }
}
