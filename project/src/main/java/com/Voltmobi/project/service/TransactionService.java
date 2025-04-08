package com.Voltmobi.project.service;

import com.Voltmobi.project.model.Transactions;
import com.Voltmobi.project.model.TransactionStatus;
import com.Voltmobi.project.repository.TransactionRepository;

import jakarta.mail.MessagingException;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final JavaMailSender mailSender;

    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    @Autowired
    public TransactionService(TransactionRepository transactionRepository, JavaMailSender mailSender) {
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

    public List<Transactions> getAllTransactionsWithFilters(String status, LocalDate fromDate, LocalDate toDate, Long planId) {
        return transactionRepository.findTransactionsWithFilters(status, fromDate, toDate, planId);
    }
    
    public List<Transactions> findSoonToExpireTransactions(LocalDateTime now, LocalDateTime threeDaysFromNow) {
        return transactionRepository.findSoonToExpireTransactions(now, threeDaysFromNow);
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

    public boolean sendReminderEmail(String toEmail, String mobileNumber, String planName, String expiryDate) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            logger.error("Cannot send reminder email: recipient email is empty");
            return false;
        }

        try {
            logger.info("Preparing reminder email for: {}, mobile: {}", toEmail, mobileNumber);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Your MobiComm Plan is Expiring Soon");

            String emailContent = generateReminderEmailContent(mobileNumber, planName, expiryDate);
            helper.setText(emailContent, true); // true indicates HTML content

            mailSender.send(message);
            logger.info("Successfully sent reminder email to: {}", toEmail);
            return true;
        } catch (MessagingException e) {
            logger.error("Failed to send reminder email to: {}. Error: {}", toEmail, e.getMessage(), e);
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error sending reminder email: {}", e.getMessage(), e);
            return false;
        }
    }

    private String generateReminderEmailContent(String mobileNumber, String planName, String expiryDate) {
        return String.format(
                "<html><body>" +
                "<h2>Your MobiComm Plan is Expiring Soon</h2>" +
                "<p>Dear Customer,</p>" +
                "<p>Your plan <strong>%s</strong> for mobile number <strong>%s</strong> is expiring on <strong>%s</strong>.</p>" +
                "<p>Please renew your plan to continue enjoying uninterrupted services.</p>" +
                "<p>Thank you,<br>MobiComm Team</p>" +
                "</body></html>",
                planName, mobileNumber, expiryDate
                );
            }
        
    
    public Map<String, Object> getTransactionStatistics(LocalDate fromDate, LocalDate toDate) {
        Map<String, Object> stats = transactionRepository.getTransactionStats(fromDate, toDate);
        
        // Add additional metrics if needed
        stats.put("popularPlans", transactionRepository.getPopularPlans(
            fromDate, 
            toDate, 
            5)); // Top 5 plans
        
        return stats;
    }

    public List<Map<String, Object>> getRevenueTrend(LocalDate fromDate, LocalDate toDate) {
        return transactionRepository.getDailyRevenueTrend(fromDate, toDate);
    }}