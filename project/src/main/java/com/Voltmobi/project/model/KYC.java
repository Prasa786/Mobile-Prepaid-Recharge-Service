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
    @JoinColumn(name = "user_id")
    private Users user;
    private String aadhaarNumber;
    private String panNumber;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KYCStatus status = KYCStatus.PENDING;


    private LocalDateTime verificationDate;
    
    @Column(nullable = false, unique = true)
    private String documentNumber; 
    @Lob // Large Object for storing file bytes
    private byte[] documentFront;

    @Lob
    private byte[] documentBack;
}