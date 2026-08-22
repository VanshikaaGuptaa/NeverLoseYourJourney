package com.example.journey.controller;

import com.example.journey.dto.JourneySaveRequest;
import com.example.journey.dto.JourneySaveResponse;
import com.example.journey.model.Journey;
import com.example.journey.service.JourneyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/journey")
public class JourneyController {
    private final JourneyService journeyService;

    public JourneyController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @PostMapping("/save")
    public ResponseEntity<JourneySaveResponse> saveJourney(
            @RequestHeader("Authorization") String bearer,
            @RequestBody JourneySaveRequest request) {
        try {
            String token = bearer.replace("Bearer ", "");
            JourneySaveResponse resp = journeyService.saveJourney(token, request);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("(503)")) {
                return ResponseEntity.status(503).build();
            }
            if (e.getMessage() != null && e.getMessage().contains("autosave failure")) {
                return ResponseEntity.status(500).build();
            }
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<Journey> loadLatest(@RequestHeader("Authorization") String bearer) {
        try {
            String token = bearer.replace("Bearer ", "");
            Optional<Journey> journeyOpt = journeyService.loadLatest(token);
            return journeyOpt.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.noContent().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
