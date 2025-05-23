package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.RechargePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface RechargePlanRepository extends JpaRepository<RechargePlan, Long> {

    // Fixed category query methods
    @Query("SELECT r FROM RechargePlan r WHERE r.category.categoryId = :categoryId AND r.deleted = false")
    List<RechargePlan> findByCategoryId(@Param("categoryId") Long categoryId);
    
    @Query("SELECT r FROM RechargePlan r WHERE r.category.categoryName = :categoryName AND r.deleted = false AND r.active = true")
    List<RechargePlan> findByCategoryName(@Param("categoryName") String categoryName);
    
    long countByDeletedFalse();
    long countByDeletedFalseAndActiveTrue();
    // Other methods remain the same
    List<RechargePlan> findByNameContainingIgnoreCaseAndDeletedFalse(String name);
    List<RechargePlan> findByPriceBetweenAndDeletedFalse(BigDecimal minPrice, BigDecimal maxPrice);
    List<RechargePlan> findByValidityDaysAndDeletedFalse(long validityDays);
    List<RechargePlan> findByDataLimitAndDeletedFalse(BigDecimal dataLimit);
    List<RechargePlan> findByPriceAndDeletedFalse(BigDecimal price);
    List<RechargePlan> findByDeletedFalse();
    List<RechargePlan> findByDeletedFalseAndActiveTrue();

    @Query("SELECT r FROM RechargePlan r WHERE r.deleted = false AND r.active = true " +
            "AND (:categoryId IS NULL OR r.category.categoryId = :categoryId) " +
            "AND (:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:minPrice IS NULL OR r.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR r.price <= :maxPrice) " +
            "AND (:minValidity IS NULL OR r.validityDays >= :minValidity) " +
            "AND (:maxValidity IS NULL OR r.validityDays <= :maxValidity) " +
            "AND (:minData IS NULL OR r.dataLimit >= :minData) " +
            "AND (:maxData IS NULL OR r.dataLimit <= :maxData)")
     List<RechargePlan> searchActiveRechargePlans(
            @Param("categoryId") Long categoryId,
            @Param("name") String name,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minValidity") Long minValidity,
            @Param("maxValidity") Long maxValidity,
            @Param("minData") BigDecimal minData,
            @Param("maxData") BigDecimal maxData
     );
    
   
        
        @Query("SELECT new map(c.categoryName as category, COUNT(p) as count) " +
               "FROM RechargePlan p JOIN p.category c " +
               "WHERE p.deleted = false " +
               "GROUP BY c.categoryName")
        List<Map<String, Object>> countPlansByCategory();

        @Query("SELECT new map(p.name as name, COUNT(t) as purchases) " +
               "FROM Transactions t JOIN t.plan p " +
               "WHERE t.status = 'SUCCESS' " +
               "GROUP BY p.name " +
               "ORDER BY COUNT(t) DESC LIMIT :limit")
        List<Map<String, Object>> findPopularPlans(@Param("limit") int limit);

        @Query("SELECT new map(p.name as planName, FUNCTION('DATE', t.transactionDate) as date, SUM(t.amount) as revenue) " +
               "FROM Transactions t JOIN t.plan p " +
               "WHERE t.status = 'SUCCESS' AND " +
               "(cast(:fromDate as date) IS NULL OR t.transactionDate >= :fromDate) AND " +
               "(cast(:toDate as date) IS NULL OR t.transactionDate <= :toDate) " +
               "GROUP BY p.name, FUNCTION('DATE', t.transactionDate) " +
               "ORDER BY FUNCTION('DATE', t.transactionDate)")
        List<Map<String, Object>> getRevenueTrendByPlan(@Param("fromDate") LocalDate fromDate, 
                                                      @Param("toDate") LocalDate toDate);
        
        
        

        

        
    }
