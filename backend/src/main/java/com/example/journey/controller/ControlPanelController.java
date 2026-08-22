package com.example.journey.controller;

import com.example.journey.config.SimulationConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Simple control panel used by the demo UI to trigger simulated failures.
 */
@RestController
@RequestMapping("/api/control")
public class ControlPanelController {
    private final SimulationConfig simulationConfig;

    public ControlPanelController(SimulationConfig simulationConfig) {
        this.simulationConfig = simulationConfig;
    }

    @PostMapping("/expire-auth")
    public ResponseEntity<Void> expireAuth() {
        simulationConfig.expireAuthSession = true;
        return ResponseEntity.ok().build();
    }

    @PostMapping("/network-failure")
    public ResponseEntity<Void> networkFailure() {
        simulationConfig.forceNetworkFailure = true;
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delay-response")
    public ResponseEntity<Void> delayResponse(@RequestParam long millis) {
        simulationConfig.delayResponseMillis = millis;
        return ResponseEntity.ok().build();
    }

    @PostMapping("/otp-delay")
    public ResponseEntity<Void> otpDelay(@RequestParam long millis) {
        simulationConfig.otpDelayMillis = millis;
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fail-next-autosave")
    public ResponseEntity<Void> failNextAutosave() {
        simulationConfig.failNextAutosave = true;
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetAll() {
        simulationConfig.reset();
        return ResponseEntity.ok().build();
    }
}
