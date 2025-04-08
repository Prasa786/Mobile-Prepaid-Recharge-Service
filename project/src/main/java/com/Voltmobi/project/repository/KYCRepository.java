package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.KYC;
import com.Voltmobi.project.model.KYCStatus;
import com.Voltmobi.project.model.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface KYCRepository extends JpaRepository<KYC, Long> {

    Optional<KYC> findByUser_UserId(Long userId);
    List<KYC> findByStatus(KYCStatus status); 

    Optional<KYC> findByUserUsername(String username);
    Optional<KYC> findByUser(Users user);
}
