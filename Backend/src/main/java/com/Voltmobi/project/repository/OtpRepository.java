package com.Voltmobi.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.Voltmobi.project.model.Otp;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByPhoneNumber(String phoneNumber);
    @Transactional
    void deleteByPhoneNumber(String phoneNumber);
    @Transactional
    @Modifying
    @Query("DELETE FROM Otp o WHERE o.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpiredOtps();
}

