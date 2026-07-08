package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.dto.LoginRequest;
import com.hotelgrande.erp.dto.LoginResponse;
import com.hotelgrande.erp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController — handles all authentication-related HTTP endpoints.
 *
 * <p>Base URL: {@code /api/auth} (publicly accessible — configured in
 * {@link com.hotelgrande.erp.config.SecurityConfig}).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>{@code POST /api/auth/login} — authenticate and receive a JWT</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * Login endpoint — validates credentials and returns a JWT response.
     *
     * <h4>Request body (JSON):</h4>
     * <pre>
     * {
     *   "email":    "admin@hotelgrande.com",
     *   "password": "admin123"
     * }
     * </pre>
     *
     * <h4>Success response (200 OK):</h4>
     * <pre>
     * {
     *   "token":       "eyJhbGci...",
     *   "role":        "ADMIN",
     *   "redirectUrl": "/admin",
     *   "fullName":    "Alex Johnson",
     *   "email":       "admin@hotelgrande.com"
     * }
     * </pre>
     *
     * <h4>Failure response (401 Unauthorized):</h4>
     * <pre>
     * {
     *   "message": "Invalid email or password."
     * }
     * </pre>
     *
     * @param request the validated login payload from the request body
     * @return {@code 200 OK} with a {@link LoginResponse}, or {@code 401} on failure
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Delegate authentication logic entirely to the service layer
            LoginResponse response = userService.authenticate(request);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException ex) {
            // Return 401 with a user-friendly message (never expose stack traces)
            return ResponseEntity
                    .status(401)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    /**
     * Health-check endpoint — confirms the auth service is reachable.
     * Useful for debugging CORS and connectivity issues.
     *
     * <p>{@code GET /api/auth/ping} → {@code 200 OK} with body {@code "pong"}</p>
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
