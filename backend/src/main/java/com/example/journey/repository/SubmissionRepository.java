package com.example.journey.repository;

import com.example.journey.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByTransactionId(String transactionId);
    Optional<Submission> findByIdempotencyKey(String idempotencyKey);
}
