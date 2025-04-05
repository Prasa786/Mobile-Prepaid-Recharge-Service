package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.*;
import com.Voltmobi.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class KYCService {

    @Autowired
    private KYCRepository kycRepository;

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
}
