package com.hotelgrande.erp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * LoginRequest DTO — carries the credentials submitted from the login form.
 *
 * <p>Received as the request body of {@code POST /api/auth/login}.
 * Bean Validation annotations ensure the controller rejects malformed
 * requests before they ever reach the service layer.</p>
 *
 * <p>Example JSON payload:</p>
 * <pre>
 * {
 *   "email":    "admin@hotelgrande.com",
 *   "password": "admin123"
 * }
 * </pre>
 *
 * @param email    the user's email address (login identifier)
 * @param password the user's raw (plain-text) password — never logged or stored
 */
public record LoginRequest(

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be a valid email address")
    String email,

    @NotBlank(message = "Password must not be blank")
    String password

) {}
