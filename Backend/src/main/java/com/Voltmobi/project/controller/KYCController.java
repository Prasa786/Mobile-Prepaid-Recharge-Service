package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.KYC;
import com.Voltmobi.project.model.KYCStatus;
import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.repository.KYCRepository;
import com.Voltmobi.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api") // Changed base mapping to /api to match frontend
@CrossOrigin(origins = "*") // Allow frontend access (adjust origin as needed)
public class KYCController {

    @Autowired
    private KYCRepository kycRepository;

    @Autowired
    private UserRepository userRepository;

    // New endpoint for fetching all KYC requests
    @GetMapping("/kyc-requests")
    public ResponseEntity<List<KYC>> getAllKYCRequests() {
        List<KYC> kycRequests = kycRepository.findAll();
        return ResponseEntity.ok(kycRequests);
    }

    @PutMapping("/kyc/verify/{kycId}")
    public ResponseEntity<String> verifyKYC(@PathVariable Long kycId, @RequestParam boolean approved) {
        KYC kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        if (approved) {
            kyc.setStatus(KYCStatus.VERIFIED);
            kyc.setVerificationDate(LocalDateTime.now());
            kycRepository.save(kyc);
            return ResponseEntity.ok("KYC Verified Successfully!");
        } else {
            kyc.setStatus(KYCStatus.REJECTED);
            kycRepository.save(kyc);
            return ResponseEntity.ok("KYC Rejected!");
        }
    }

    @GetMapping("/kyc/status/{userId}")
    public ResponseEntity<KYCStatus> getKYCStatus(@PathVariable Long userId) {
        Optional<KYC> kyc = kycRepository.findById(userId);
        if (kyc.isPresent()) {
            return ResponseEntity.ok(kyc.get().getStatus());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    @PostMapping("/kyc/register")
    public ResponseEntity<String> registerUser(@RequestBody Users user) {
        Optional<KYC> kyc = kycRepository.findByUser(user);

        if (kyc.isPresent() && kyc.get().getStatus() == KYCStatus.VERIFIED) {
            userRepository.save(user);
            return ResponseEntity.ok("User Registered Successfully!");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("KYC Not Verified! Please wait for admin approval.");
    }

    @PostMapping("/kyc/submit")
    public ResponseEntity<String> submitKYC(@RequestBody KYC kycRequest) {
        Users user = userRepository.findById(kycRequest.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<KYC> existingKYC = kycRepository.findByUser(user);
        if (existingKYC.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("KYC already submitted!");
        }

        kycRequest.setUser(user);
        kycRequest.setStatus(KYCStatus.PENDING);
        kycRepository.save(kycRequest);
        return ResponseEntity.ok("KYC submitted successfully! Please wait for admin approval.");
    }

    @PutMapping("/kyc/approve/{kycId}")
    public ResponseEntity<String> approveKYC(@PathVariable Long kycId, @RequestParam boolean approved) {
        KYC kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        if (approved) {
            kyc.setStatus(KYCStatus.VERIFIED);
            kyc.setVerificationDate(LocalDateTime.now());
            kycRepository.save(kyc);
            return ResponseEntity.ok("KYC Verified Successfully! User can now register.");
        } else {
            kyc.setStatus(KYCStatus.REJECTED);
            kycRepository.save(kyc);
            return ResponseEntity.ok("KYC Rejected! Please resubmit.");
        }
    }
}