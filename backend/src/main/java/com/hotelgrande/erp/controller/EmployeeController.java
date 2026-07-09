package com.hotelgrande.erp.controller;

import com.hotelgrande.erp.entity.User;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin
public class EmployeeController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getAllEmployees(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody User user, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can add employees.");
        }


        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email " + user.getEmail() + " is already in use.");
        }

        String rawPassword = user.getRawPassword();
        if (rawPassword != null && !rawPassword.isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
        } else {

            user.setPasswordHash(passwordEncoder.encode("changeit123"));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestBody User details,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }

        return userRepository.findById(id)
                .map(user -> {
                    if (currentUser.getRole() == Role.MANAGER) {

                        user.setShift(details.getShift());
                    } else {

                        user.setFullName(details.getFullName());


                        if (!user.getEmail().equalsIgnoreCase(details.getEmail())) {
                            if (userRepository.findByEmail(details.getEmail()).isPresent()) {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body("Email " + details.getEmail() + " is already in use.");
                            }
                            user.setEmail(details.getEmail());
                        }

                        user.setPhone(details.getPhone());
                        user.setAddress(details.getAddress());
                        user.setDepartment(details.getDepartment());
                        user.setEmpRole(details.getEmpRole());
                        user.setShift(details.getShift());
                        user.setJoinDate(details.getJoinDate());
                        user.setUsername(details.getUsername());
                        user.setRole(details.getRole());
                        user.setEnabled(details.isEnabled());

                        String rawPassword = details.getRawPassword();
                        if (rawPassword != null && !rawPassword.isEmpty()) {
                            user.setPasswordHash(passwordEncoder.encode(rawPassword));
                        }
                    }
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can delete employees.");
        }

        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
