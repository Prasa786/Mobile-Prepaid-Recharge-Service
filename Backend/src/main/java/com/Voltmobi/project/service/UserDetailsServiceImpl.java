package com.Voltmobi.project.service;

import com.Voltmobi.project.model.Users;
import com.Voltmobi.project.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

//   
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Users> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        Users user = userOptional.get();

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())  // ✅ Use email for admin login
                .password(user.getPassword()) // ✅ Hashed password should be loaded
                .authorities(Collections.singleton(new SimpleGrantedAuthority(user.getRole().getRoleType().name())))
                .build();
    }

}
