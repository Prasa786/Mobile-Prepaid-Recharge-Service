package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.RechargePlan;
import com.Voltmobi.project.repository.RechargePlanRepository;
import com.Voltmobi.project.repository.CategoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional(readOnly = true)
public class RechargePlanService {

    private final RechargePlanRepository rechargePlanRepository;
    private final CategoryRepository categoryRepository;

    public RechargePlanService(RechargePlanRepository rechargePlanRepository, 
                             CategoryRepository categoryRepository) {
        this.rechargePlanRepository = rechargePlanRepository;
        this.categoryRepository = categoryRepository;
    }

    // READ operations
    public List<RechargePlan> getAllRechargePlans() {
        return rechargePlanRepository.findByDeletedFalse();
    }

    public List<RechargePlan> getActiveRechargePlans() {
        return rechargePlanRepository.findByDeletedFalseAndActiveTrue();
    }

    public RechargePlan getRechargePlanById(Long id) {
        return rechargePlanRepository.findById(id)
                .filter(plan -> !plan.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Recharge Plan not found with ID: " + id));
    }

    public List<RechargePlan> getRechargePlansByCategoryId(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with ID: " + categoryId);
        }
        return rechargePlanRepository.findByCategoryId(categoryId);
    }

    public List<RechargePlan> getRechargePlansByCategoryName(String categoryName) {
        if (!categoryRepository.existsByCategoryName(categoryName)) {
            throw new ResourceNotFoundException("Category not found with name: " + categoryName);
        }
        return rechargePlanRepository.findByCategoryName(categoryName);
    }

    public List<RechargePlan> searchRechargePlans(Long categoryId, String name, 
            BigDecimal minPrice, BigDecimal maxPrice,
            Long minValidity, Long maxValidity,
            BigDecimal minData, BigDecimal maxData) {
return rechargePlanRepository.searchActiveRechargePlans(
categoryId,
name != null && !name.isEmpty() ? name : null,  // Handle empty string as null
minPrice,
maxPrice,
minValidity,
maxValidity,
minData,
maxData
);
}

    // WRITE operations
    @Transactional
    public RechargePlan createRechargePlan(RechargePlan rechargePlan) {
        validateCategoryExists(rechargePlan.getCategory().getCategoryId());
        
        rechargePlan.setActive(true);
        rechargePlan.setDeleted(false);
        return rechargePlanRepository.save(rechargePlan);
    }

    @Transactional
    public RechargePlan updateRechargePlan(Long id, RechargePlan planDetails) {
        RechargePlan existingPlan = getRechargePlanById(id);

        existingPlan.setName(planDetails.getName());
        existingPlan.setDescription(planDetails.getDescription());
        existingPlan.setPrice(planDetails.getPrice());
        existingPlan.setDataLimit(planDetails.getDataLimit());
        existingPlan.setCallMinutes(planDetails.getCallMinutes());
        existingPlan.setSmsCount(planDetails.getSmsCount());
        existingPlan.setValidityDays(planDetails.getValidityDays());
        
        if (planDetails.getCategory() != null) {
            validateCategoryExists(planDetails.getCategory().getCategoryId());
            existingPlan.setCategory(planDetails.getCategory());
        }

        return rechargePlanRepository.save(existingPlan);
    }

    @Transactional
    public void togglePlanStatus(Long id, boolean active) {
        RechargePlan plan = getRechargePlanById(id);
        plan.setActive(active);
        rechargePlanRepository.save(plan);
        log.info("Set active status to {} for plan ID: {}", active, id);
    }

    @Transactional
    public void softDeleteRechargePlan(Long id) {
        RechargePlan plan = getRechargePlanById(id);
        plan.setDeleted(true);
        plan.setActive(false);
        rechargePlanRepository.save(plan);
        log.info("Soft deleted recharge plan with ID: {}", id);
    }

    // Helper methods
    private void validateCategoryExists(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with ID: " + categoryId);
        }
    }
    public Map<String, Object> getPlanStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        stats.put("totalPlans", rechargePlanRepository.countByDeletedFalse());
        stats.put("activePlans", rechargePlanRepository.countByDeletedFalseAndActiveTrue());
        
        // Plan distribution by category
        stats.put("categoryDistribution", rechargePlanRepository.countPlansByCategory());
        
        // Popular plans (top 5)
        stats.put("popularPlans", rechargePlanRepository.findPopularPlans(5));
        
        // Calculate total revenue from transactions
        List<Map<String, Object>> revenueData = rechargePlanRepository.getRevenueTrendByPlan(
            LocalDate.now().minusMonths(1), 
            LocalDate.now()
        );
        
        BigDecimal totalRevenue = revenueData.stream()
            .map(m -> (BigDecimal)m.get("revenue"))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        stats.put("totalRevenue", totalRevenue);
        
        return stats;
    }
}