package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.UserUsage;
import com.Voltmobi.project.service.UserUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/user-usage")
@CrossOrigin(origins = "*")
public class UserUsageController {

    @Autowired
    private UserUsageService userUsageService;

    // ADMINS CAN VIEW ALL USER USAGE RECORDS
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<UserUsage>> getAllUserUsage() {
        return ResponseEntity.ok(userUsageService.getAllUserUsage());
    }

    // USERS CAN VIEW THEIR OWN USAGE HISTORY
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserUsage>> getUserUsageByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userUsageService.getUserUsageByUserId(userId));
    }

    // USERS CAN LOG THEIR USAGE
    @PostMapping
    public ResponseEntity<UserUsage> logUserUsage(@Valid @RequestBody UserUsage usage) {
        return new ResponseEntity<>(userUsageService.recordUserUsage(usage), HttpStatus.CREATED);
    }
}
