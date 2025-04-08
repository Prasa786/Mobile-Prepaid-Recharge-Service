package com.Voltmobi.project.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recharge_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recharge_history {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private RechargePlan plan;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RechargeStatus status; // Changed to a more specific enum

    @Column(nullable = false, updatable = false)
    private LocalDateTime rechargeDate;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payments payment;

    @PrePersist
    protected void onCreate() {
        this.rechargeDate = LocalDateTime.now();
    }
}

// Define a specific enum for recharge status
