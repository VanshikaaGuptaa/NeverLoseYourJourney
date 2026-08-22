package com.example.journey.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "journeys")
public class Journey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String currentStep; // e.g., "ADDRESS"
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
    private Long version = 0L;

    @Lob
    @Column(name = "form_data", columnDefinition = "TEXT")
    private String formDataJson; // stores snapshot of all steps as JSON
}
