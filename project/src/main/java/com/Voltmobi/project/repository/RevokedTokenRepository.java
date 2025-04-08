package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.RevokedToken;
import com.Voltmobi.project.model.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    Optional<RevokedToken> findByToken(String token);

//    @Transactional
//    @Modifying
//    @Query("DELETE FROM RevokedToken r WHERE r.createdAt < :expiryTime")
//    void deleteByExpirationTimeBefore(LocalDateTime cutoffTime);



}