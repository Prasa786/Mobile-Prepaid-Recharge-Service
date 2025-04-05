package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.RechargePlan;
import com.Voltmobi.project.service.RechargePlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/recharge-plans")
@CrossOrigin(origins = "*")
public class RechargePlanController {

    private final RechargePlanService rechargePlanService;

    public RechargePlanController(RechargePlanService rechargePlanService) {
        this.rechargePlanService = rechargePlanService;
    }

    // Get all active recharge plans
    @GetMapping
    public ResponseEntity<List<RechargePlan>> getAllActiveRechargePlans() {
        return ResponseEntity.ok(rechargePlanService.getActiveRechargePlans());
    }

    // Get all recharge plans (including inactive - Admin only)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RechargePlan>> getAllRechargePlans() {
        return ResponseEntity.ok(rechargePlanService.getAllRechargePlans());
    }

    // Search recharge plans with filters
    @GetMapping("/search")
    public ResponseEntity<List<RechargePlan>> searchRechargePlans(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Long minValidity,
            @RequestParam(required = false) Long maxValidity,
            @RequestParam(required = false) BigDecimal minData,
            @RequestParam(required = false) BigDecimal maxData) {
        List<RechargePlan> plans = rechargePlanService.searchRechargePlans(
            categoryId, 
            name, 
            minPrice, 
            maxPrice, 
            minValidity, 
            maxValidity, 
            minData, 
            maxData
        );
        return ResponseEntity.ok(plans);
    }
    // Get recharge plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<RechargePlan> getRechargePlanById(@PathVariable Long id) {
        return ResponseEntity.ok(rechargePlanService.getRechargePlanById(id));
    }

    // Get recharge plans by category ID
    @GetMapping("/category/id/{categoryId}")
    public ResponseEntity<List<RechargePlan>> getRechargePlansByCategoryId(@PathVariable Long categoryId) {
        return ResponseEntity.ok(rechargePlanService.getRechargePlansByCategoryId(categoryId));
    }

    // Get recharge plans by category name
    @GetMapping("/category/name/{categoryName}")
    public ResponseEntity<List<RechargePlan>> getRechargePlansByCategoryName(@PathVariable String categoryName) {
        return ResponseEntity.ok(rechargePlanService.getRechargePlansByCategoryName(categoryName));
    }

    // Create a new recharge plan (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<RechargePlan> createRechargePlan(@Valid @RequestBody RechargePlan rechargePlan) {
        return new ResponseEntity<>(rechargePlanService.createRechargePlan(rechargePlan), HttpStatus.CREATED);
    }

    // Update a recharge plan (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RechargePlan> updateRechargePlan(
            @PathVariable Long id, 
            @Valid @RequestBody RechargePlan rechargePlanDetails) {
        return ResponseEntity.ok(rechargePlanService.updateRechargePlan(id, rechargePlanDetails));
    }

    // Toggle plan active status (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> togglePlanStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        rechargePlanService.togglePlanStatus(id, active);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteRechargePlan(@PathVariable Long id) {
        rechargePlanService.softDeleteRechargePlan(id);
        return ResponseEntity.noContent().build();
    }
}