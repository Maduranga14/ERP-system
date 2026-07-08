package com.hotelgrande.erp.service;

import com.hotelgrande.erp.dto.LoginRequest;
import com.hotelgrande.erp.dto.LoginResponse;
import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor  // Lombok: generates constructor injecting all final fields
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService      jwtService;


    public LoginResponse authenticate(LoginRequest request) {


        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));


        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled. Contact your administrator.");
        }


        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }


        String token = jwtService.generateToken(user);


        String redirectUrl = resolveRedirectUrl(user);


        return new LoginResponse(
                token,
                user.getRole().name(),
                redirectUrl,
                user.getFullName(),
                user.getEmail()
        );
    }


    private String resolveRedirectUrl(User user) {
        return switch (user.getRole()) {
            case ADMIN        -> "/admin";
            case MANAGER      -> "/manager";
            case RECEPTIONIST -> "/receptionist";
            case HOUSEKEEPER  -> "/housekeeper";
        };
    }
}
