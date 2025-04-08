package com.Voltmobi.project.repository;

import com.Voltmobi.project.model.Recharge_history;
import com.Voltmobi.project.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RechargeHistoryRepository extends JpaRepository<Recharge_history, Long> { 
    List<Recharge_history> findByUser_UserId(long userId);
    List<Recharge_history> findByPayment_PaymentId(long paymentId);
    List<Recharge_history> findByStatus(PaymentStatus status);
    List<Recharge_history> findByUser_UserIdAndStatus(Long userId, PaymentStatus status);
//    List<Recharge_history> findByUserId(long userId);
}
