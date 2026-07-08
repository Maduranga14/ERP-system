package com.hotelgrande.erp.service;

import com.hotelgrande.erp.dto.LoginRequest;
import com.hotelgrande.erp.dto.LoginResponse;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * UserService — core authentication business logic.
 *
 * <h3>Authentication flow:</h3>
 * <ol>
 *   <li>Look up the user by email in the database.</li>
 *   <li>Verify the submitted password against the stored BCrypt hash.</li>
 *   <li>Generate a signed JWT via {@link JwtService}.</li>
 *   <li>Resolve the correct frontend redirect URL based on the user's role.</li>
 *   <li>Return a {@link LoginResponse} DTO to the controller.</li>
 * </ol>
 *
 * <p>Why not use Spring Security's {@code AuthenticationManager}?
 * We call BCrypt directly here for simplicity and explicitness, keeping
 * the flow readable. You can wire in an AuthenticationManager later
 * if you add more auth providers (e.g., OAuth2, LDAP).</p>
 */
@Service
@RequiredArgsConstructor  // Lombok: generates constructor injecting all final fields
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService      jwtService;

    /**
     * Authenticates a user and returns a JWT + role + redirect URL.
     *
     * @param request the login credentials from the frontend
     * @return a {@link LoginResponse} containing the JWT, role, and redirect path
     * @throws BadCredentialsException if the email is not found or the password is incorrect
     */
    public LoginResponse authenticate(LoginRequest request) {

        // ── Step 1: Load the user by email ────────────────────────────────────
        // We use a generic exception message ("Invalid credentials") to avoid
        // leaking whether the email or the password was wrong (security best practice).
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        // ── Step 2: Check the account is not disabled ─────────────────────────
        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled. Contact your administrator.");
        }

        // ── Step 3: Verify the password ───────────────────────────────────────
        // BCryptPasswordEncoder.matches(rawPassword, encodedPassword)
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        // ── Step 4: Generate JWT ──────────────────────────────────────────────
        String token = jwtService.generateToken(user);

        // ── Step 5: Resolve redirect URL based on role ────────────────────────
        String redirectUrl = resolveRedirectUrl(user);

        // ── Step 6: Build and return the response ─────────────────────────────
        return new LoginResponse(
                token,
                user.getRole().name(),
                redirectUrl,
                user.getFullName(),
                user.getEmail()
        );
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Maps a user's {@link com.hotelgrande.erp.enums.Role} to the
     * corresponding React Router frontend path.
     *
     * <p>These paths must match the routes defined in your frontend
     * {@code App.jsx} ({@code /admin}, {@code /manager}, etc.).</p>
     *
     * @param user the authenticated user
     * @return the frontend route path as a string
     */
    private String resolveRedirectUrl(User user) {
        return switch (user.getRole()) {
            case ADMIN        -> "/admin";
            case MANAGER      -> "/manager";
            case RECEPTIONIST -> "/receptionist";
            case HOUSEKEEPER  -> "/housekeeper";
        };
    }
}
