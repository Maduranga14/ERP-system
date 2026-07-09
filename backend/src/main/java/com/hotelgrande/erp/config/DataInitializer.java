package com.hotelgrande.erp.config;

import com.hotelgrande.erp.entity.*;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("DataInitializer: Data already present — skipping seed.");
            return;
        }

        log.info("DataInitializer: Seeding Hotel Grande ERP database...");


        createUser("Alex Johnson", "admin@hotelgrande.com", "admin123", Role.ADMIN);
        createUser("Maria Garcia", "manager@hotelgrande.com", "manager123", Role.MANAGER);
        createUser("James Williams", "receptionist@hotelgrande.com", "front123", Role.RECEPTIONIST);
        createUser("Emily Chen", "housekeeper@hotelgrande.com", "house123", Role.HOUSEKEEPER);
        createUser("Sarah Jenkins", "sarah@hotelgrande.com", "house123", Role.HOUSEKEEPER);
        createUser("David Miller", "david@hotelgrande.com", "house123", Role.HOUSEKEEPER);

        log.info("DataInitializer: Seeded default users.");

        // Rooms are managed entirely via the admin portal — no seeds here

        Customer c1 = createCustomer("Alexander Sterling", "Regular Member", "alex.sterling@example.com", "+1 555-0199", "United States", "US-998822", "1988-05-12", "102 Pine St, New York", "Active", "2024-01-15", List.of("Extra towels", "High floor"));
        Customer c2 = createCustomer("Samantha Vance", "VIP Guest", "samantha.vance@example.com", "+44 20 7946 0958", "United Kingdom", "UK-441122", "1992-10-24", "45 Park Ln, London", "Active", "2024-02-10", List.of("Ocean view", "Feather pillows"));
        Customer c3 = createCustomer("Carlos Mendez", "New Guest", "carlos.mendez@example.com", "+34 91 371 2345", "Spain", "ES-773322", "1985-07-03", "Gran Via 12, Madrid", "New", "2024-07-01", List.of("Late check-in"));

        log.info("DataInitializer: Seeded default customers.");
        log.info("DataInitializer: Database initialization completed successfully!");
    }

    private User createUser(String fullName, String email, String rawPwd, Role role) {
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPwd))
                .role(role)
                .enabled(true)
                .build();
        return userRepository.save(user);
    }

    private Customer createCustomer(String name, String tier, String email, String phone, String country, String nationalId, String dob, String address, String status, String joinedDate, List<String> preferences) {
        Customer c = Customer.builder()
                .name(name)
                .memberTier(tier)
                .email(email)
                .phone(phone)
                .country(country)
                .nationalId(nationalId)
                .dob(dob)
                .address(address)
                .status(status)
                .joinedDate(joinedDate)
                .preferences(new ArrayList<>(preferences))
                .build();
        return customerRepository.save(c);
    }
}
