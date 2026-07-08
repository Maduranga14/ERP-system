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


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;


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


    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
