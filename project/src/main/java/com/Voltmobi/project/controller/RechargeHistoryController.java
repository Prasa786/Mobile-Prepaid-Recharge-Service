package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.Recharge_history;
import com.Voltmobi.project.service.RechargeHistoryService;
import com.Voltmobi.project.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/recharge-history")
@CrossOrigin(origins = "*")
public class RechargeHistoryController {

    @Autowired
    private RechargeHistoryService rechargeHistoryService;

    
    
    // ADMINS CAN VIEW ALL RECHARGE HISTORY
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Recharge_history>> getAllRechargeHistories() {
        return ResponseEntity.ok(rechargeHistoryService.getAllRechargeHistories());
    }

    // USERS CAN VIEW THEIR OWN RECHARGE HISTORY
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recharge_history>> getRechargeHistoryByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(rechargeHistoryService.getRechargeHistoryByUser(userId));
    }
    @PostMapping
    public ResponseEntity<Recharge_history> createRechargeHistory(
            @Valid @RequestBody Recharge_history history) {
        return new ResponseEntity<>(
            rechargeHistoryService.createRechargeHistory(history), 
            HttpStatus.CREATED
        );
    }
}
