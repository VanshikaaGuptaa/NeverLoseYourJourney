package com.example.journey.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "webauthn_credentials")
public class WebAuthnCredential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "credential_id", nullable = false, length = 1000)
    private String credentialId;

    @Column(name = "public_key", nullable = false, length = 2000)
    private String publicKey;
}
