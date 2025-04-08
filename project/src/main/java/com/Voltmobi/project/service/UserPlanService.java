package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.*;
import com.Voltmobi.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserPlanService {

    @Autowired
    private UserPlanRepository userPlanRepository;

    public List<UserPlans> getAllUserPlans() {
        List<UserPlans> userPlans = userPlanRepository.findAll();
        if (userPlans.isEmpty()) {
            throw new ResourceNotFoundException("No user plans found");
        }
        return userPlans;
    }

    public List<UserPlans> getUserPlansByUserId(Long userId) {
        List<UserPlans> userPlans = userPlanRepository.findByUser_UserIdAndIsActiveTrue(userId);
        if (userPlans.isEmpty()) {
            throw new ResourceNotFoundException("No active plans found for user ID: " + userId);
        }
        return userPlans;
    }

    public UserPlans subscribeToPlan(UserPlans userPlan) {
        userPlan.setStartDate(LocalDateTime.now());
        userPlan.setEndDate(userPlan.getStartDate().plusDays(userPlan.getPlan().getValidityDays())); // ✅ Auto-set expiry
        userPlan.setActive(true);
        return userPlanRepository.save(userPlan);
    }

    public void markExpiredPlans() {
        List<UserPlans> activePlans = userPlanRepository.findAll();
        for (UserPlans plan : activePlans) {
            if (plan.getEndDate().isBefore(LocalDateTime.now())) {
                plan.setActive(false);
                userPlanRepository.save(plan);
            }
        }
    }
}
