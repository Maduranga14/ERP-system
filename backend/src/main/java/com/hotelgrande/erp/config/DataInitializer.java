package com.hotelgrande.erp.config;

import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer — seeds the four default ERP users on application startup.
 *
 * <p>Implements {@link CommandLineRunner}, which Spring Boot calls automatically
 * after the application context is fully initialized. This runs every time the
 * app starts (since we use H2 with {@code create-drop} DDL).</p>
 *
 * <h3>Seeded users:</h3>
 * <table border="1">
 *   <tr><th>Role</th><th>Email</th><th>Password</th><th>Frontend Path</th></tr>
 *   <tr><td>ADMIN</td><td>admin@hotelgrande.com</td><td>admin123</td><td>/admin</td></tr>
 *   <tr><td>MANAGER</td><td>manager@hotelgrande.com</td><td>manager123</td><td>/manager</td></tr>
 *   <tr><td>RECEPTIONIST</td><td>receptionist@hotelgrande.com</td><td>front123</td><td>/receptionist</td></tr>
 *   <tr><td>HOUSEKEEPER</td><td>housekeeper@hotelgrande.com</td><td>house123</td><td>/housekeeper</td></tr>
 * </table>
 *
 * <p><b>Production note:</b> Remove this class (or guard with an environment
 * check) before deploying to production. Real user accounts should be created
 * through a secure admin UI, not seeded in code.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j  // Lombok: generates a SLF4J logger field named 'log'
public class DataInitializer implements CommandLineRunner {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only seed if the table is empty (avoids duplicates on restart)
        if (userRepository.count() > 0) {
            log.info("DataInitializer: Users already present — skipping seed.");
            return;
        }

        log.info("DataInitializer: Seeding default ERP users...");

        // ── Admin ──────────────────────────────────────────────────────────────
        createUser("Alex Johnson",   "admin@hotelgrande.com",        "admin123",   Role.ADMIN);

        // ── Manager ───────────────────────────────────────────────────────────
        createUser("Maria Garcia",   "manager@hotelgrande.com",      "manager123", Role.MANAGER);

        // ── Receptionist ──────────────────────────────────────────────────────
        createUser("James Williams", "receptionist@hotelgrande.com", "front123",   Role.RECEPTIONIST);

        // ── Housekeeper ───────────────────────────────────────────────────────
        createUser("Emily Chen",     "housekeeper@hotelgrande.com",  "house123",   Role.HOUSEKEEPER);

        log.info("DataInitializer: Seeded {} users successfully.", userRepository.count());
    }

    /**
     * Helper — builds, BCrypt-hashes, and persists a single User entity.
     *
     * @param fullName the display name shown in the dashboard
     * @param email    the login email
     * @param rawPwd   the plain-text password (hashed before saving)
     * @param role     the user's role in the ERP system
     */
    private void createUser(String fullName, String email, String rawPwd, Role role) {
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPwd)) // BCrypt hash stored
                .role(role)
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("  Created user: {} [{}]", email, role);
    }
}
