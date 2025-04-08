package com.Voltmobi.project.service;
import com.Voltmobi.project.model.*;
import com.Voltmobi.project.repository.*;
import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.Payments;
import com.Voltmobi.project.repository.PaymentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;
    @Autowired
    private RechargePlanRepository rechargePlanRepository;

    public List<Payments> getAllPayments() {
        List<Payments> payments = paymentRepository.findAll();
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("No payments found");
        }
        return payments;
    }

    public List<Payments> getPaymentsByUser(Long userId) {
        List<Payments> payments = paymentRepository.findByUser_UserId(userId);
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("No payments found for user with ID: " + userId);
        }
        return payments;
    }

    public Payments getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }

    public Payments createPayment(@Valid Payments payment) {
        if (payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        return paymentRepository.save(payment);
    }
    


     
      

        public PaymentProcessResponse processPayment(PaymentProcessRequest request) {
            // 1. Validate request
            if (request.getAmount() <= 0) {
                throw new IllegalArgumentException("Amount must be greater than zero");
            }
            
            // 2. Find plan (user is optional now)
            RechargePlan plan = rechargePlanRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new RuntimeException("Plan not found"));
            
            // 3. Create and save Payment
            Payments payment = new Payments();
            payment.setAmount(BigDecimal.valueOf(request.getAmount()));
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(request.getRazorpayPaymentId());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment = paymentRepository.save(payment);
            
            // 4. Create and save Transaction
            Transactions transaction = new Transactions();
            transaction.setPlan(plan);
            transaction.setPayment(payment);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction = transactionRepository.save(transaction);
            
            // 5. Create and save Recharge History
            Recharge_history rechargeHistory = new Recharge_history();
            rechargeHistory.setPlan(plan);
            rechargeHistory.setAmount(BigDecimal.valueOf(request.getAmount()));
            rechargeHistory.setStatus(RechargeStatus.COMPLETED);
            rechargeHistory.setPayment(payment);
            rechargeHistory = rechargeHistoryRepository.save(rechargeHistory);
            
            return new PaymentProcessResponse(
                payment.getPaymentId(),
                transaction.getTransactionId(),
                rechargeHistory.getHistoryId()
            );
        }

      

        // DTO classes remain unchanged
        public static class PaymentProcessRequest {
            private String razorpayPaymentId;
            private double amount;
            private String paymentMethod;
            private Long planId;
            
            // Getters and setters
            public String getRazorpayPaymentId() { return razorpayPaymentId; }
            public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
            public double getAmount() { return amount; }
            public void setAmount(double amount) { this.amount = amount; }
            public String getPaymentMethod() { return paymentMethod; }
            public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
            public Long getPlanId() { return planId; }
            public void setPlanId(Long planId) { this.planId = planId; }
        }

        public static class PaymentProcessResponse {
            private Long paymentId;
            private Long transactionId;
            private Long rechargeHistoryId;
            
            public PaymentProcessResponse(Long paymentId, Long transactionId, Long rechargeHistoryId) {
                this.paymentId = paymentId;
                this.transactionId = transactionId;
                this.rechargeHistoryId = rechargeHistoryId;
            }
            
            // Getters
            public Long getPaymentId() { return paymentId; }
            public Long getTransactionId() { return transactionId; }
            public Long getRechargeHistoryId() { return rechargeHistoryId; }
        }
    }
    
    


