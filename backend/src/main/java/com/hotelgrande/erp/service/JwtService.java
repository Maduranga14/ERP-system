package com.hotelgrande.erp.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtService — handles all JWT creation and validation logic.
 *
 * <p>Uses the JJWT 0.12.x API. Tokens are signed with HMAC-SHA256 (HS256)
 * using a secret key configured in {@code application.properties}.</p>
 *
 * <h3>Token lifecycle:</h3>
 * <ol>
 *   <li>User logs in → {@link UserService} calls {@link #generateToken(UserDetails)}</li>
 *   <li>Frontend stores the JWT in localStorage</li>
 *   <li>On future requests, frontend sends {@code Authorization: Bearer <token>}</li>
 *   <li>A JWT filter (to be added later) calls {@link #isTokenValid(String, UserDetails)}</li>
 * </ol>
 */
@Service
public class JwtService {

    // ── Configuration (from application.properties) ───────────────────────────

    /** Hex-encoded secret key. Must be at least 32 bytes (256 bits) for HS256. */
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    /** Token validity in milliseconds. Default: 86400000 ms = 24 hours. */
    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Generates a signed JWT for the given user.
     *
     * <p>The token contains:</p>
     * <ul>
     *   <li>Subject: the user's email (username)</li>
     *   <li>Extra claims: {@code role} for role-based authorization</li>
     *   <li>IssuedAt: now</li>
     *   <li>Expiration: now + {@link #jwtExpirationMs}</li>
     * </ul>
     *
     * @param userDetails the authenticated user (must implement UserDetails)
     * @return the compact, Base64URL-encoded JWT string
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        // Embed the role in the token so the frontend can optionally read it
        extraClaims.put("role", userDetails.getAuthorities()
                .iterator().next().getAuthority()
                .replace("ROLE_", ""));
        return buildToken(extraClaims, userDetails);
    }

    /**
     * Extracts the subject (email) from the JWT.
     *
     * @param token the compact JWT string
     * @return the email stored as the subject claim
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Validates that the token belongs to the given user and is not expired.
     *
     * @param token       the compact JWT string from the Authorization header
     * @param userDetails the user loaded from the database
     * @return {@code true} if the token is valid and unexpired
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Constructs and signs the JWT.
     */
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)                          // custom claims (role)
                .subject(userDetails.getUsername())           // email as subject
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())                    // HS256 signing
                .compact();
    }

    /**
     * Generic claim extractor — applies the provided resolver function to the
     * parsed Claims object.
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses the JWT and returns all claims. Throws an exception if the
     * token is invalid or tampered.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Returns the signing key derived from the configured secret.
     * The secret is treated as a UTF-8 byte sequence.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Checks whether the token's expiration timestamp is before now. */
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
