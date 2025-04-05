package com.Voltmobi.project.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_usage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usageId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(nullable = false)
    private String usageType;  // 'call', 'sms', 'data'

    @Column(nullable = false)
    private int usageValue;    // Minutes, Count, MB

    @Column(nullable = false, updatable = false)
    private LocalDateTime usageDate = LocalDateTime.now();
}
