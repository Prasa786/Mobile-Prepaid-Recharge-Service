package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.*;
import com.Voltmobi.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserUsageService {

    @Autowired
    private UserUsageRepository userUsageRepository;

    public List<UserUsage> getAllUserUsage() {
        List<UserUsage> usageRecords = userUsageRepository.findAll();
        if (usageRecords.isEmpty()) {
            throw new ResourceNotFoundException("No user usage records found");
        }
        return usageRecords;
    }

    public List<UserUsage> getUserUsageByUserId(Long userId) {
        List<UserUsage> usageRecords = userUsageRepository.findByUser_UserId(userId);
        if (usageRecords.isEmpty()) {
            throw new ResourceNotFoundException("No usage records found for user ID: " + userId);
        }
        return usageRecords;
    }

    public UserUsage recordUserUsage(UserUsage userUsage) {
        if (userUsage.getUsageValue() <= 0) {
            throw new IllegalArgumentException("Usage value must be greater than zero");
        }
        return userUsageRepository.save(userUsage);
    }
}
