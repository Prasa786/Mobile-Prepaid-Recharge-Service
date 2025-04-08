package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.KYC;
import com.Voltmobi.project.model.KYCStatus;
import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.repository.KYCRepository;
import com.Voltmobi.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KYCService {

    private final KYCRepository kycRepository;
    private final UserRepository userRepository;

    public List<KYC> getAllKYCs() {
        List<KYC> kycs = kycRepository.findAll();
        if (kycs.isEmpty()) {
            throw new ResourceNotFoundException("No KYC records found");
        }
        return kycs;
    }

    public KYC getKYCByUser(Long userId) {
        return kycRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC record not found for user ID: " + userId));
    }

    public KYC createKYC(KYC kyc) {
        kyc.setStatus(KYCStatus.PENDING);
        return kycRepository.save(kyc);
    }

    public KYC verifyKYC(Long kycId, KYCStatus status) {
        return kycRepository.findById(kycId).map(kyc -> {
            kyc.setStatus(status);
            kyc.setVerificationDate(LocalDateTime.now());
            return kycRepository.save(kyc);
        }).orElseThrow(() -> new ResourceNotFoundException("KYC record not found with ID: " + kycId));
    }

    public KYCStatus getKYCStatus(String username) {
        Optional<KYC> kyc = kycRepository.findByUserUsername(username);
        return kyc.map(KYC::getStatus).orElse(null);
    }

    public String submitKYC(KYC kycRequest, String username, MultipartFile documentFront, MultipartFile documentBack) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Optional<KYC> existingKYC = kycRepository.findByUser(user);
        if (existingKYC.isPresent()) {
            return "KYC already submitted!";
        }
        kycRequest.setDocumentNumber(generateDocumentNumber());
        kycRequest.setUser(user);
        kycRequest.setStatus(KYCStatus.PENDING);

        if (documentFront != null && !documentFront.isEmpty()) {
            try {
                kycRequest.setDocumentFront(documentFront.getBytes());
            } catch (Exception e) {
                throw new RuntimeException("Failed to process documentFront: " + e.getMessage());
            }
        }
        if (documentBack != null && !documentBack.isEmpty()) {
            try {
                kycRequest.setDocumentBack(documentBack.getBytes());
            } catch (Exception e) {
                throw new RuntimeException("Failed to process documentBack: " + e.getMessage());
            }
        }

        kycRepository.save(kycRequest);
        return "KYC submitted successfully! Please wait for admin approval.";
    }
    private String generateDocumentNumber() {
        return "KYC-" + System.currentTimeMillis(); // Simple example
    }
}