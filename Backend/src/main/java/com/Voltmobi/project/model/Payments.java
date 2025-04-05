package com.Voltmobi.project.model;

import jakarta.persistence.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;
    @ManyToOne
   
    @JoinColumn(name = "user_id", nullable = false) 
    private Users user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime paymentDate;
    
    @Column(name = "transaction_id") 
    private String transactionId;

    @Column(nullable = false)
    private String paymentMethod; 

    @PrePersist
    protected void onCreate() {
        this.paymentDate = LocalDateTime.now();
    }


}


