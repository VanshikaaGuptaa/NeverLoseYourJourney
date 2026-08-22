package com.example.journey.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Holds mutable simulation flags that can be toggled via the Control Panel API.
 * All fields are volatile to allow safe concurrent updates.
 */
@Component
@ConfigurationProperties(prefix = "simulation")
public class SimulationConfig {
    /** Simulate authentication session expiry on next request */
    public volatile boolean expireAuthSession = false;
    /** Simulate network failure (server returns 503) on next request */
    public volatile boolean forceNetworkFailure = false;
    /** Simulate delayed response (in ms) on next request */
    public volatile long delayResponseMillis = 0L;
    /** Simulate OTP delay (in ms) */
    public volatile long otpDelayMillis = 0L;
    /** Simulate next autosave failure */
    public volatile boolean failNextAutosave = false;
    /** Reset all flags */
    public void reset() {
        expireAuthSession = false;
        forceNetworkFailure = false;
        delayResponseMillis = 0L;
        otpDelayMillis = 0L;
        failNextAutosave = false;
    }
}
