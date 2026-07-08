package com.hotelgrande.erp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CorsConfig — configures Cross-Origin Resource Sharing (CORS) for the API.
 *
 * <p>Without this, the browser will block the React frontend (running on
 * {@code http://localhost:5173}) from calling the Spring Boot backend
 * (running on {@code http://localhost:8080}) due to the Same-Origin Policy.</p>
 *
 * <p>This bean is consumed by {@link SecurityConfig}, which registers it
 * with Spring Security's filter chain. That approach ensures CORS headers
 * are added BEFORE Spring Security processes the request — which is
 * required for preflight {@code OPTIONS} requests to work correctly.</p>
 *
 * <h3>Production note:</h3>
 * Replace {@code http://localhost:5173} with your deployed frontend URL
 * (e.g. {@code https://erp.hotelgrande.com}) before going live.
 */
@Configuration
public class CorsConfig {

    /**
     * Defines the CORS policy applied to all API endpoints ({@code /**}).
     *
     * <ul>
     *   <li>Allowed origins: Vite dev server ({@code http://localhost:5173})</li>
     *   <li>Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS</li>
     *   <li>Allowed headers: all headers (required for {@code Authorization: Bearer})</li>
     *   <li>Exposed headers: {@code Authorization} (so the frontend can read it)</li>
     *   <li>Credentials: true (needed if you switch to httpOnly cookies later)</li>
     *   <li>Max age: 3600 seconds — browser caches preflight for 1 hour</li>
     * </ul>
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ── Allowed Origins ────────────────────────────────────────────────────
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",    // Vite dev server
                "http://localhost:3000"     // alternate dev port (CRA, etc.)
        ));

        // ── Allowed HTTP Methods ───────────────────────────────────────────────
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // ── Allowed Request Headers ────────────────────────────────────────────
        // "*" allows Content-Type, Authorization, Accept, Origin, etc.
        config.setAllowedHeaders(List.of("*"));

        // ── Exposed Response Headers ───────────────────────────────────────────
        // Allow the frontend's JS to read the Authorization header from responses
        config.setExposedHeaders(List.of("Authorization"));

        // ── Allow Credentials ──────────────────────────────────────────────────
        config.setAllowCredentials(true);

        // ── Preflight Cache Duration ───────────────────────────────────────────
        config.setMaxAge(3600L);

        // ── Register for all paths ─────────────────────────────────────────────
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
