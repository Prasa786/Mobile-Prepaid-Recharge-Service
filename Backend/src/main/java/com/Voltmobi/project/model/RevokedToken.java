package com.Voltmobi.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "revoked_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevokedToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String token;
    
    public RevokedToken(String token) {
        this.token = token;
    }
}
