package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Basic CRUD operations
    Optional<Category> findByCategoryId(Long categoryId);
    Optional<Category> findByCategoryName(String categoryName);
    
    // Status-based queries
    List<Category> findByDeletedFalse();
    List<Category> findByDeletedFalseAndActiveTrue();
    Page<Category> findByDeletedFalse(Pageable pageable);
    boolean existsByCategoryName(String categoryName);
    // Custom query for recharge plans
    @Query("SELECT c FROM Category c WHERE c.rechargePlans IS NOT EMPTY AND c.deleted = false")
    List<Category> findCategoriesWithRechargePlans();
    
    // Search functionality
    List<Category> findByCategoryNameContainingIgnoreCase(String name);
    
    // Count queries
    long countByActiveTrueAndDeletedFalse();
    
    // Bulk update
    @Modifying
    @Query("UPDATE Category c SET c.active = :active WHERE c.categoryId = :id")
    int updateActiveStatus(@Param("id") Long id, @Param("active") boolean active);
}