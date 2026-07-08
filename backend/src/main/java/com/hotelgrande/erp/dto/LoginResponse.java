package com.hotelgrande.erp.dto;

/**
 * LoginResponse DTO — returned to the frontend on successful authentication.
 *
 * <p>The frontend should:</p>
 * <ol>
 *   <li>Store the {@link #token} in {@code localStorage} as {@code "jwtToken"}.</li>
 *   <li>Navigate to {@link #redirectUrl} using {@code navigate(response.redirectUrl)}
 *       (React Router) or {@code window.location.href}.</li>
 *   <li>Display {@link #fullName} in the dashboard header/avatar.</li>
 * </ol>
 *
 * <p>Example JSON response:</p>
 * <pre>
 * {
 *   "token":       "eyJhbGciOiJIUzI1NiJ9...",
 *   "role":        "ADMIN",
 *   "redirectUrl": "/admin",
 *   "fullName":    "Alex Johnson",
 *   "email":       "admin@hotelgrande.com"
 * }
 * </pre>
 *
 * @param token       the signed JWT — sent as {@code Authorization: Bearer <token>} on all subsequent requests
 * @param role        the user's role string (e.g. "ADMIN") — useful for conditional UI rendering
 * @param redirectUrl the frontend route to navigate to after login
 * @param fullName    the user's display name for the dashboard greeting
 * @param email       the authenticated user's email
 */
public record LoginResponse(

    String token,
    String role,
    String redirectUrl,
    String fullName,
    String email

) {}
