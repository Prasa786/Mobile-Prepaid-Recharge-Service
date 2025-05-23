package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.Transactions;
import com.Voltmobi.project.model.TransactionStatus;
import com.Voltmobi.project.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/transactions")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*",
        methods = {RequestMethod.GET,RequestMethod.POST,RequestMethod.PUT,RequestMethod.PATCH,RequestMethod.OPTIONS},
        allowedHeaders = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transactions>> getTransactionsByUserId(@PathVariable long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<Transactions>> getTransactionsByPlanId(@PathVariable long planId) {
        return ResponseEntity.ok(transactionService.getTransactionsByPlanId(planId));
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<List<Transactions>> getTransactionsByPaymentId(@PathVariable long paymentId) {
        return ResponseEntity.ok(transactionService.getTransactionsByPaymentId(paymentId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Transactions>> getTransactionsByStatus(@PathVariable TransactionStatus status) {
        return ResponseEntity.ok(transactionService.getTransactionsByStatus(status));
    }

    @GetMapping
    public ResponseEntity<List<Transactions>> getAllTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long planId) 
    {
        return ResponseEntity.ok(transactionService.getAllTransactionsWithFilters(status, fromDate, toDate, planId));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getTransactionStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate)
    {
        return ResponseEntity.ok(transactionService.getTransactionStatistics(fromDate, toDate));
    }

    @GetMapping("/mobile/{mobileNumber}")
    public ResponseEntity<List<Transactions>> getTransactionsByMobileNumber(@PathVariable String mobileNumber) {
        return ResponseEntity.ok(transactionService.getTransactionsByMobileNumber(mobileNumber));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Transactions>> getRecentTransactions(
            @RequestParam(defaultValue = "30") Integer days)
    {
        return ResponseEntity.ok(transactionService.getRecentTransactions(days));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> softDeleteTransaction(@PathVariable Long id) {
        try {
            Transactions transaction = transactionService.getTransactionById(id);
            transaction.setStatus(TransactionStatus.FAILED);
            transactionService.saveTransaction(transaction);
            return ResponseEntity.ok("Transaction deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting transaction: " + e.getMessage());
        }
    }
    
    @GetMapping("/soon-to-expire")
    public ResponseEntity<List<Transactions>> getSoonToExpireTransactions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysFromNow = now.plusDays(3);
        List<Transactions> transactions = transactionService.findSoonToExpireTransactions(now, threeDaysFromNow);
        return ResponseEntity.ok(transactions);
    }
    
    @PostMapping("/send-reminder")
    public ResponseEntity<String> sendReminderEmail(
            @RequestParam String toEmail,
            @RequestParam String mobileNumber,
            @RequestParam String planName,
            @RequestParam String expiryDate) {
        boolean success = transactionService.sendReminderEmail(toEmail, mobileNumber, planName, expiryDate);
        if (success) {
            return ResponseEntity.ok("Reminder email sent successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send reminder email.");
        }
    }
}