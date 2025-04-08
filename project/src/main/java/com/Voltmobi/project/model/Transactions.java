package com.Voltmobi.project.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transactions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;
    
    @ManyToOne
    @JoinColumn(name = "plan_id")
    private RechargePlan plan;
    
    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payments payment;
    
    private LocalDateTime transactionDate;
    
    private LocalDateTime expiryDate;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;
    
    // Added amount field
    @Column(name = "amount")
    private Double amount; // Use Double, BigDecimal, or whatever fits your use case
}