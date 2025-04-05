package com.Voltmobi.project.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.math.BigDecimal;

@Entity
@Table(name = "recharge_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RechargePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;
    
    private String name;
    private BigDecimal price;
    private BigDecimal dataLimit; // Changed from String to BigDecimal for numeric handling
    private String benefits;
    private String planType;
    private String description;
    private int smsCount;
    private int callMinutes;
    private long validityDays; // Using this instead of validity String
    
    private boolean active = true; // Added for status toggling
    private boolean deleted = false; // Added for soft delete

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoryId", nullable = false)
    @JsonBackReference
    private Category category;

    // Removed validity String as validityDays serves the purpose
}