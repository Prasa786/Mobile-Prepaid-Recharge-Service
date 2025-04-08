package com.Voltmobi.project.controller;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.KYC;
import com.Voltmobi.project.model.KYCStatus;
import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.service.KYCService;
import com.Voltmobi.project.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final KYCService kycService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody Users user) {
        try {
            if (user.getMobile() == null || user.getMobile().isEmpty()) {
                return ResponseEntity.badRequest().body("Mobile number is required.");
            }
            Users registeredUser = userService.saveUser(user);
            return ResponseEntity.ok("User registered successfully with ID: " + registeredUser.getUserId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/check-mobile/{mobile}")
    public ResponseEntity<Boolean> checkMobileExists(@PathVariable String mobile) {
        try {
            boolean exists = userService.userExistsByMobile(mobile);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(false);
        }
    }

    @GetMapping("/kyc/status/{username}")
    public ResponseEntity<KYCStatus> getKYCStatus(@PathVariable String username) {
        KYCStatus status = kycService.getKYCStatus(username);
        if (status != null) {
            return ResponseEntity.ok(status);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    @PostMapping(value = "/kyc/submit", consumes = "multipart/form-data")
    public ResponseEntity<String> submitKYC(
            @RequestPart("username") String username,
            @RequestPart("aadhaar") String aadhaar,
            @RequestPart("pan") String pan,
            @RequestPart("documentFront") MultipartFile documentFront,
            @RequestPart(value = "documentBack", required = false) MultipartFile documentBack) {
        try {
            KYC kycRequest = new KYC();
            kycRequest.setAadhaarNumber(aadhaar);
            kycRequest.setPanNumber(pan);
            String result = kycService.submitKYC(kycRequest, username, documentFront, documentBack);
            if ("KYC already submitted!".equals(result)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error submitting KYC: " + e.getMessage());
        }
    }

    // Optional: Add from KYCController if needed
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/kyc-requests")
    public ResponseEntity<List<KYC>> getAllKYCRequests() {
        List<KYC> kycRequests = kycService.getAllKYCs();
        return ResponseEntity.ok(kycRequests);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/kyc/approve/{kycId}")
    public ResponseEntity<String> approveKYC(@PathVariable Long kycId, @RequestParam boolean approved) {
        KYC kyc = kycService.verifyKYC(kycId, approved ? KYCStatus.VERIFIED : KYCStatus.REJECTED);
        return ResponseEntity.ok(approved ? "KYC Verified Successfully!" : "KYC Rejected!");
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Users> updateUser(@PathVariable Long id, @Valid @RequestBody Users updatedUser) {
        return ResponseEntity.ok(userService.updateUser(id, updatedUser));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}