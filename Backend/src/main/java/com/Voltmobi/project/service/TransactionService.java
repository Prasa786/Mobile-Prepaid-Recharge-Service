package com.Voltmobi.project.service;

import com.Voltmobi.project.model.Transactions;
import com.Voltmobi.project.model.TransactionStatus;
import com.Voltmobi.project.repository.TransactionRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository, 
                            JavaMailSender mailSender) {
        this.transactionRepository = transactionRepository;
        this.mailSender = mailSender;
    }

    public List<Transactions> getTransactionsByUserId(long userId) {
        return transactionRepository.findByUser_UserId(userId);
    }

    public List<Transactions> getTransactionsByPlanId(long planId) {
        return transactionRepository.findByPlan_PlanId(planId);
    }

    public List<Transactions> getTransactionsByPaymentId(long paymentId) {
        return transactionRepository.findByPayment_PaymentId(paymentId);
    }

    public List<Transactions> getTransactionsByStatus(TransactionStatus status) {
        return transactionRepository.findByStatus(status);
    }

    public List<Transactions> getAllTransactionsWithFilters(String status, 
                                                          LocalDate fromDate, 
                                                          LocalDate toDate, 
                                                          Long planId) {
        return transactionRepository.findTransactionsWithFilters(status, fromDate, toDate, planId);
    }
    
    public List<Transactions> findSoonToExpireTransactions(LocalDateTime now, 
                                                         LocalDateTime threeDaysFromNow) {
        return transactionRepository.findSoonToExpireTransactions(now, threeDaysFromNow);
    }

    public Map<String, Object> getTransactionStatistics(LocalDate fromDate, 
                                                      LocalDate toDate) {
        Object[] result = transactionRepository.getTransactionStatistics(fromDate, toDate);
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalTransactions", result[0]);
        statistics.put("totalRevenue", result[1]);
        return statistics;
    }

    public List<Transactions> getTransactionsByMobileNumber(String mobileNumber) {
        return transactionRepository.findTransactionsByMobileNumber(mobileNumber);
    }

    public List<Transactions> getRecentTransactions(Integer days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        return transactionRepository.findRecentTransactions(startDate);
    }

    public Transactions saveTransaction(Transactions transaction) {
        return transactionRepository.save(transaction);
    }

    public Transactions getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + id));
    }

    public boolean sendReminderEmail(String toEmail, 
                                   String mobileNumber, 
                                   String planName, 
                                   String expiryDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(toEmail);
            helper.setSubject("Your Plan is Expiring Soon");
            
            String emailContent = String.format(
                "<html><body>" +
                "<h2>Your Plan is Expiring Soon</h2>" +
                "<p>Dear Customer,</p>" +
                "<p>Your plan <strong>%s</strong> for mobile number <strong>%s</strong> " +
                "is expiring on <strong>%s</strong>.</p>" +
                "<p>Please renew your plan to continue enjoying our services.</p>" +
                "<p>Thank you,<br>Customer Support Team</p>" +
                "</body></html>",
                planName, mobileNumber, expiryDate);
                
            helper.setText(emailContent, true);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}