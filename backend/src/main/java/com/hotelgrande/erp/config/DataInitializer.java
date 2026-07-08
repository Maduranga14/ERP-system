package com.hotelgrande.erp.config;

import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j  
public class DataInitializer implements CommandLineRunner {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
       
        if (userRepository.count() > 0) {
            log.info("DataInitializer: Users already present — skipping seed.");
            return;
        }

        log.info("DataInitializer: Seeding default ERP users...");

       
        createUser("Alex Johnson",   "admin@hotelgrande.com",        "admin123",   Role.ADMIN);

      
        createUser("Maria Garcia",   "manager@hotelgrande.com",      "manager123", Role.MANAGER);

        
        createUser("James Williams", "receptionist@hotelgrande.com", "front123",   Role.RECEPTIONIST);

       
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
