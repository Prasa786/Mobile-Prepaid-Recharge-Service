package com.Voltmobi.project.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    private final Map<String, OtpDetails> otpStorage = new HashMap<>();
    private static final int OTP_EXPIRY_MINUTES = 5;

    /**
     * Generate and store OTP with expiry time
     */
    public String generateAndStoreOtp(String mobile) {
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        otpStorage.put(mobile, new OtpDetails(otp, expiryTime));
        return otp;
    }

    /**
     * Validate OTP (Check expiry before verification)
     */
    public boolean validateOtp(String mobile, String userOtp) {
        if (!otpStorage.containsKey(mobile)) {
            return false; // No OTP exists for this number
        }

        OtpDetails otpDetails = otpStorage.get(mobile);
        if (otpDetails.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpStorage.remove(mobile); // Remove expired OTP
            return false;
        }

        boolean isValid = otpDetails.getOtp().equals(userOtp);
        if (isValid) {
            otpStorage.remove(mobile); // Clear OTP after successful validation
        }
        return isValid;
    }

    /**
     * Remove OTP manually if needed
     */
    public void clearOtp(String mobile) {
        otpStorage.remove(mobile);
    }

    /**
     * Generate a 6-digit OTP
     */
    private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    /**
     * Format phone number to E.164 standard (+CountryCode)
     */
    public String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber.startsWith("+")) {
            return phoneNumber;
        }
        return "+91" + phoneNumber; // Default country code is +91 (India)
    }

    /**
     * Inner class to store OTP with expiry time
     */
    private static class OtpDetails {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpDetails(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }
    }
}
