package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.*;
import com.Voltmobi.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class RechargeHistoryService {

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    public List<Recharge_history> getAllRechargeHistories() {
        List<Recharge_history> history = rechargeHistoryRepository.findAll();
        if (history.isEmpty()) {
            throw new ResourceNotFoundException("No recharge history found");
        }
        return history;
    }

    
    public List<Recharge_history> getRechargeHistoryByUser(Long userId) {
        List<Recharge_history> history = rechargeHistoryRepository.findByUser_UserId(userId);
        if (history.isEmpty()) {
            throw new ResourceNotFoundException("No recharge history found for user ID: " + userId);
        }
        return history;
    }

    public Recharge_history createRechargeHistory(Recharge_history rechargeHistory) {
        if (rechargeHistory.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Recharge amount must be greater than zero");
        }
        return rechargeHistoryRepository.save(rechargeHistory);
    }
}
