package com.Voltmobi.project.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    private final OtpService otpService;

    public TwilioService(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    /**
     * Generate OTP and send via Twilio SMS
     */
    public void sendOtp(String phoneNumber) {
        String formattedPhone = otpService.formatPhoneNumber(phoneNumber);
        String otp = otpService.generateAndStoreOtp(formattedPhone);

        try {
            Message.creator(
                new PhoneNumber(formattedPhone),
                new PhoneNumber(twilioPhoneNumber),
                "Your OTP is: " + otp + ". It expires in 5 minutes."
            ).create();

            System.out.println("OTP sent successfully to " + formattedPhone);
        } catch (Exception e) {
            System.err.println("Failed to send OTP: " + e.getMessage());
        }
       
    }
    public void sendSMS(String phoneNumber, String messageText) {
        try {
            Message message = Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                messageText
            ).create();

            System.out.println("✅ SMS sent successfully to " + phoneNumber + " | SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS: " + e.getMessage());
        }
    }

}
