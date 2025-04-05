package com.Voltmobi.project.model;



import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPlans {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userPlanId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private RechargePlan plan;

    @Column(nullable = false)
    private LocalDateTime startDate = LocalDateTime.now();
    @Column(nullable = false)
    private LocalDateTime endDate;
    
  

    private boolean isActive = true; // Track active status

    @PrePersist
    protected void calculateEndDate() {
        if (plan != null) {
            this.endDate = startDate.plusDays(plan.getValidityDays()); // Set expiry based on plan duration
        }
    }
}
