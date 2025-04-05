package com.Voltmobi.project.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "kyc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KYC {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long kycId;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private Users user;
    
    @Column(nullable = false)
    private String documentType;

    @Column(nullable = false, unique = true)
    private String documentNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KYCStatus status = KYCStatus.PENDING;

    private LocalDateTime verificationDate;
}