//package com.Voltmobi.project.service;
//
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.stereotype.Service;
//import javax.mail.MessagingException;
//import javax.mail.internet.MimeMessage;
//
//@Service
//public class MailSenderService {
//    
//    private final JavaMailSender mailSender;
//    
//    public MailSenderService(JavaMailSender mailSender) {
//        this.mailSender = mailSender;
//    }
//    
//    public void sendEmail(String to, String subject, String body) {
//        try {
//            MimeMessage message = mailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message);
//            
//            helper.setTo(to);
//            helper.setSubject(subject);
//            helper.setText(body, true); // true indicates HTML content
//            
//            mailSender.send(message);
//        } catch (MessagingException e) {
//            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
//        }
//    }
//}
