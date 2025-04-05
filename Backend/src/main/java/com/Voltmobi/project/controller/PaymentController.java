package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.Payments;
import com.Voltmobi.project.service.PaymentService;
import com.Voltmobi.project.service.PaymentService.PaymentProcessRequest;
import com.Voltmobi.project.service.PaymentService.PaymentProcessResponse;
import com.Voltmobi.project.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    //  USERS CAN SEE THEIR OWN PAYMENTS
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payments>> getPaymentsByUser(@PathVariable Long userId) {
        List<Payments> payments = paymentService.getPaymentsByUser(userId);
        return payments.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(payments);
    }

    //  ADMINS CAN SEE ALL PAYMENTS
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Payments>> getAllPayments() {
        List<Payments> payments = paymentService.getAllPayments();
        return payments.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(payments);
    }

    //  ADMINS CAN GET PAYMENT BY ID	
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Payments> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    //  USERS CAN CREATE PAYMENTS
    @PostMapping
    public ResponseEntity<Payments> createPayment(@Valid @RequestBody Payments payment) {
        return new ResponseEntity<>(paymentService.createPayment(payment), HttpStatus.CREATED);
    }


    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentService.PaymentProcessRequest request) {
        try {
            PaymentService.PaymentProcessResponse response = paymentService.processPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
   
}
