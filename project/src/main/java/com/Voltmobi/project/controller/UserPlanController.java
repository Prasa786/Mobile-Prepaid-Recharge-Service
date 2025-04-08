package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.UserPlans;
import com.Voltmobi.project.service.UserPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/user-plans")
@CrossOrigin(origins = "*")
public class UserPlanController {

    @Autowired
    private UserPlanService userPlanService;

    // ADMINS CAN VIEW ALL USER PLANS
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<UserPlans>> getAllUserPlans() {
        return ResponseEntity.ok(userPlanService.getAllUserPlans());
    }

    // USERS CAN VIEW THEIR OWN ACTIVE PLANS
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserPlans>> getUserPlansByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userPlanService.getUserPlansByUserId(userId));
    }

    // USERS CAN SUBSCRIBE TO A PLAN
    @PostMapping
    public ResponseEntity<UserPlans> subscribeToPlan(@Valid @RequestBody UserPlans userPlan) {
        return new ResponseEntity<>(userPlanService.subscribeToPlan(userPlan), HttpStatus.CREATED);
    }
}
