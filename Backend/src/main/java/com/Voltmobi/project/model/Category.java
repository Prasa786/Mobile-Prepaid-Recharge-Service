package com.Voltmobi.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId; // Changed from categoryId to match controller

    @NotBlank(message = "Category name is required")
    @Column(name = "category_name", unique = true, nullable = false)
    private String categoryName; // Changed from categoryName to match controller

    @Column(nullable = false)
    private boolean active = true; // Changed default to true to match controller logic

    @Column(nullable = false)
    private boolean deleted = false; // Added for soft delete

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<RechargePlan> rechargePlans;
}