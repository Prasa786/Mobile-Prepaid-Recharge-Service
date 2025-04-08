package com.Voltmobi.project.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")  // ✅ Fetch secret key from application.properties
    private String secretKey;

    @Value("${jwt.expiration}")  // ✅ Fetch token expiration time
    private long expirationTime;

    // 🔹 Generate Secret Key for signing JWT
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())  // ✅ Store username
                .claim("role", userDetails.getAuthorities().toString())  // ✅ Store role
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract Username from JWT Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ✅ Extract any claim from JWT Token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(Jwts.parserBuilder()
                .setSigningKey(getSigningKey())  // Set secret key for validation
                .build()
                .parseClaimsJws(token)
                .getBody());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            System.out.println("JWT Token has expired.");
            return false;
        } catch (JwtException e) {
            System.out.println("Invalid JWT Token.");
            return false;
        }
    }

    // 🔹 Check if token is expired
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
