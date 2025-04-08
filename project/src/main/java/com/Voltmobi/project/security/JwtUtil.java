package com.Voltmobi.project.security;

import com.Voltmobi.project.model.RevokedToken;
import com.Voltmobi.project.repository.RevokedTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import java.util.function.Function;
import java.util.logging.Logger;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")  //  Fetch from application.properties
    private String secretKey;

    @Value("${jwt.expiration}")  //  Token expiration time
    private long expirationTime;

    private final RevokedTokenRepository revokedTokenRepository;
    private static final Logger logger = Logger.getLogger(JwtUtil.class.getName());

    public JwtUtil(RevokedTokenRepository revokedTokenRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
    }

    /**
     *  Securely generate HMAC signing key
     */
    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);  //  Properly decode Base64 secret key
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     *  Generate JWT token (DO NOT store in revoked repository immediately)
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     *  Revoke token (Add to revoked repository)
     */
    public void revokeToken(String token) {
        revokedTokenRepository.save(new RevokedToken(token));
        logger.info("Token revoked: " + token);
    }

    /**
     *  Extract username from JWT token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     *  Extract any claim from the token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody());
    }

    /**
     *  Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     *  Validate token (Ensure it’s not revoked)
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            Optional<RevokedToken> revokedToken = revokedTokenRepository.findByToken(token);

            // ❌ Reject if token is expired or revoked
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token) && revokedToken.isEmpty();

            if (!isValid) {
                logger.warning("Invalid token: " + token);
            }

            return isValid;
        } catch (JwtException e) {
            logger.severe("JWT validation failed: " + e.getMessage());
            return false;  // Invalid token
        }
    }

    /**
     *  Get token expiration time in milliseconds
     */
    public long getExpirationTime() {
        return expirationTime;
    }
}
