package com.Voltmobi.project.controller;

import com.Voltmobi.project.model.AuthRequest;
import com.Voltmobi.project.model.RevokedToken;
import com.Voltmobi.project.model.RoleType;
import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.repository.RevokedTokenRepository;
import com.Voltmobi.project.security.JwtUtil;
import com.Voltmobi.project.service.OtpService;
import com.Voltmobi.project.service.TwilioService;
import com.Voltmobi.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://127.0.0.1:5500/")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final TwilioService twilioService;
    private final OtpService otpService;
    private final RevokedTokenRepository revokedTokenRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Users user) {
        if (userService.userExists(user.getMobile(), user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "User with this email or mobile already exists."));
        }
        Users savedUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "User registered successfully. Please login.",
            "user_id", savedUser.getUserId()
        ));
    }

    // Option 1: Accept phone number in the request body
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }

        try {
            twilioService.sendOtp(phoneNumber);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
        }
    }

    // Option 2: Accept phone number in the URL path
    @PostMapping("/send-otp/{phoneNumber}")
    public ResponseEntity<?> sendOtp(@PathVariable String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }

        try {
            twilioService.sendOtp(phoneNumber);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/login-otp")
    public ResponseEntity<?> loginUserWithOtp(@RequestBody Map<String, String> request) {
        String mobile = request.get("mobile");
        String otp = request.get("otp");

        if (mobile == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile and OTP are required."));
        }

        String formattedPhone = otpService.formatPhoneNumber(mobile);
        if (otpService.validateOtp(formattedPhone, otp)) {
            // ✅ Clear OTP only after successful validation
            otpService.clearOtp(formattedPhone);

            String token = jwtUtil.generateToken(formattedPhone);
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", token,
                "expires_in", jwtUtil.getExpirationTime()
            ));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid or expired OTP"));
    }

    @PostMapping("/login-admin")
    public ResponseEntity<?> loginAdmin(@RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Users user = userService.getUserByEmail(request.getUsername());

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
            }

            if (user.getRole() == null || user.getRole().getRoleType() != RoleType.ROLE_ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Not an admin."));
            }

            String token = jwtUtil.generateToken(userDetails.getUsername());
            return ResponseEntity.ok(Map.of(
                "message", "Admin login successful",
                "token", token,
                "expires_in", jwtUtil.getExpirationTime()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token format."));
        }

        String actualToken = token.substring(7);
        if (revokedTokenRepository.findByToken(actualToken).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "Token is already revoked."));
        }

        revokedTokenRepository.save(new RevokedToken(actualToken));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> requestBody) {
        String phoneNumber = requestBody.get("phoneNumber");
        String otp = requestBody.get("otp");

        if (phoneNumber == null || phoneNumber.isBlank() || otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile and OTP are required."));
        }

        boolean isValid = otpService.validateOtp(phoneNumber, otp);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired OTP."));
        }

        String token = jwtUtil.generateToken(phoneNumber);
        return ResponseEntity.ok(Map.of("message", "Login successful", "token", token));
    }
}