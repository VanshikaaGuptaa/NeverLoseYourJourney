package com.example.journey.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id")
    private Journey journey;

    private String transactionId; // unique per submission attempt
    private String idempotencyKey; // client-provided for safety
    private String status; // e.g., PROCESSING, SUCCESS, FAILED
    private Instant submittedAt = Instant.now();
}
