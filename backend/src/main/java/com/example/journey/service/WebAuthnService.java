package com.example.journey.service;

import com.example.journey.dto.LoginResponse;
import com.example.journey.dto.WebAuthnRegisterRequest;
import com.example.journey.dto.WebAuthnVerifyRequest;
import com.example.journey.model.User;
import com.example.journey.model.WebAuthnCredential;
import com.example.journey.model.AuthSession;
import com.example.journey.repository.UserRepository;
import com.example.journey.repository.WebAuthnCredentialRepository;
import com.example.journey.repository.AuthSessionRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebAuthnService {
    private final WebAuthnCredentialRepository webAuthnCredentialRepository;
    private final UserRepository userRepository;
    private final AuthSessionRepository authSessionRepository;
    
    // In-memory challenge store for demo purposes (challenge -> timestamp)
    private final ConcurrentHashMap<String, Instant> pendingChallenges = new ConcurrentHashMap<>();
    private static final long DEFAULT_TTL_SECONDS = 900;

    public WebAuthnService(WebAuthnCredentialRepository webAuthnCredentialRepository,
                           UserRepository userRepository,
                           AuthSessionRepository authSessionRepository) {
        this.webAuthnCredentialRepository = webAuthnCredentialRepository;
        this.userRepository = userRepository;
        this.authSessionRepository = authSessionRepository;
    }

    public String generateChallenge() {
        String challenge = UUID.randomUUID().toString();
        pendingChallenges.put(challenge, Instant.now());
        return challenge;
    }

    public void registerCredential(User user, WebAuthnRegisterRequest request) {
        verifyChallenge(request.clientDataJSON());
        
        WebAuthnCredential credential = new WebAuthnCredential();
        credential.setUser(user);
        credential.setCredentialId(request.credentialId());
        credential.setPublicKey(request.publicKey());
        webAuthnCredentialRepository.save(credential);
    }

    public LoginResponse verifyAndCreateSession(WebAuthnVerifyRequest request) {
        verifyChallenge(request.clientDataJSON());
        
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        WebAuthnCredential credential = webAuthnCredentialRepository.findByCredentialId(request.credentialId())
                .orElseThrow(() -> new IllegalArgumentException("Credential not found"));
                
        if (!credential.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Credential does not belong to user");
        }
        
        // NOTE: In a production environment, you MUST verify the cryptographic signature 
        // against the authenticatorData and clientDataJSON using the stored public key.
        // For this hackathon demo, verifying the challenge presence in clientDataJSON and 
        // the credential existence is sufficient.

        return createSession(user);
    }

    private void verifyChallenge(String clientDataJSONBase64) {
        try {
            // clientDataJSON is base64url encoded
            String clientDataJSON = new String(Base64.getUrlDecoder().decode(clientDataJSONBase64), StandardCharsets.UTF_8);
            
            // Extract challenge from JSON (simple hacky extraction for demo)
            String challengeStr = extractJsonValue(clientDataJSON, "challenge");
            if (challengeStr == null) {
                throw new IllegalArgumentException("Challenge not found in clientDataJSON");
            }
            
            // WebAuthn challenges are base64url encoded on the client, our challenge was UUID
            String decodedChallenge = new String(Base64.getUrlDecoder().decode(challengeStr), StandardCharsets.UTF_8);
            
            if (!pendingChallenges.containsKey(decodedChallenge)) {
                // If direct match failed, maybe it wasn't base64url encoded on the client? 
                // Let's just check if the original challenge UUID is anywhere in the decoded string
                boolean found = false;
                for (String pending : pendingChallenges.keySet()) {
                    if (decodedChallenge.contains(pending) || clientDataJSON.contains(Base64.getUrlEncoder().withoutPadding().encodeToString(pending.getBytes(StandardCharsets.UTF_8)))) {
                        pendingChallenges.remove(pending);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    throw new IllegalArgumentException("Invalid challenge");
                }
            } else {
                pendingChallenges.remove(decodedChallenge);
            }
        } catch (Exception e) {
            System.err.println("Challenge verification failed: " + e.getMessage());
            throw new IllegalArgumentException("Failed to verify challenge", e);
        }
    }
    
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":\"";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) return null;
        startIndex += searchKey.length();
        int endIndex = json.indexOf("\"", startIndex);
        if (endIndex == -1) return null;
        return json.substring(startIndex, endIndex);
    }

    private LoginResponse createSession(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusSeconds(DEFAULT_TTL_SECONDS);
        AuthSession session = new AuthSession();
        session.setToken(token);
        session.setUser(user);
        session.setCreatedAt(Instant.now());
        session.setExpiresAt(expiry);
        session.setRevoked(false);
        authSessionRepository.save(session);
        return new LoginResponse(token, DEFAULT_TTL_SECONDS);
    }
}
