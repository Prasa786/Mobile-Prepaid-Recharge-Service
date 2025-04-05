package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.RoleType;
import com.Voltmobi.project.model.Statuses;
import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.repository.RoleRepository;
import com.Voltmobi.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; //  Injected PasswordEncoder

    private final Map<String, String> otpStorage = new HashMap<>(); //  Temporary OTP storage

    private final OtpService otpService; 
    public Optional<Users> findById(Long userId) {
        return userRepository.findById(userId);
    }
    
    public Users getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null); // Returns null if user not found
    }//  Use OtpService for OTP handling

    public String generateOtp(String mobile) {
        if (userRepository.findByMobile(mobile).isEmpty()) {
            throw new ResourceNotFoundException("User with this mobile does not exist");
        }
        return otpService.generateAndStoreOtp(mobile); //  Use OtpService
    }

    public boolean verifyOtp(String mobile, String otp) {
        return otpService.validateOtp(mobile, otp); //  Use OtpService
    }

    public Users registerUser(Users user) {
        try {
            if (user.getMobile() == null || user.getMobile().isEmpty()) {
                throw new IllegalArgumentException("Mobile number cannot be null or empty");
            }

            //  Prevent duplicate mobile numbers
            if (userRepository.findByMobile(user.getMobile()).isPresent()) {
                throw new IllegalArgumentException("Mobile number already registered");
            }

            //  Assign Role based on request
            if (user.getRole() == null || user.getRole().getRoleType() == null) {
                user.setRole(roleRepository.findByRoleType(RoleType.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Default role USER not found")));
            } else {
                user.setRole(roleRepository.findByRoleType(user.getRole().getRoleType())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + user.getRole().getRoleType())));
            }

            //  Encode password before saving
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            //  Set default values
            user.setCreatedAt(LocalDateTime.now());
            user.setStatus(Statuses.ACTIVE);

            //  Save user in DB
            return userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException("Registration failed. Reason: " + e.getMessage()); //  Better exception details
        }
    }
    public Users registerAdmin(Users admin) {
        if (admin.getEmail() == null || admin.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        //  Encode the password before saving
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        admin.setCreatedAt(LocalDateTime.now()); 
        admin.setStatus(Statuses.ACTIVE);

        admin.setRole(roleRepository.findByRoleType(RoleType.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Default role ADMIN not found")));

        return userRepository.save(admin);
    }




    /**
     *  Get all users
     */
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     *  Get a user by ID
     */
    public Optional<Users> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     *  Update user details
     */
    public Users updateUser(Long id, Users updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword())); //  Secure password update
            }

            user.setRole(updatedUser.getRole());
            return userRepository.save(user);
        }).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /**
     *  Delete a user
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     *  Get users by status
     */
    public List<Users> getUsersByStatus(String status) {
        List<Users> users = userRepository.findByStatus(status);
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No users found with status: " + status);
        }
        return users;
    }

    /**
     *  Save User (Ensures role exists)
     */
    public Users saveUser(Users user) {
        if (user.getMobile() == null || user.getMobile().isEmpty()) {
            throw new IllegalArgumentException("Mobile number cannot be null or empty");
        }

        //  Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        //  Ensure Role exists before assigning
        if (user.getRole() == null || user.getRole().getRoleType() == null) {
            user.setRole(roleRepository.findByRoleType(RoleType.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default role USER not found")));
        } else {
            user.setRole(roleRepository.findByRoleType(user.getRole().getRoleType())
                .orElseGet(() -> roleRepository.save(user.getRole()))); // Save the role if not already present
        }

        //  Set creation timestamp
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     *  Find User by Mobile
     */
    public Optional<Users> getUserByMobile(String mobile) {
        return userRepository.findByMobile(mobile);
    }

    /**
     *  Check if user already exists (Mobile & Email)
     */
    public boolean userExists(String mobile, String email) {
        return userRepository.findByMobile(mobile).isPresent() || userRepository.findByEmail(email).isPresent();
    }

    public boolean userExistsByMobile(String formattedPhone) {
        return userRepository.findByMobile(formattedPhone).isPresent();
    }
}
