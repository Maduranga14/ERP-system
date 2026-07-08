package com.hotelgrande.erp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * SecurityConfig — configures Spring Security for the Hotel Grande ERP API.
 *
 * <h3>Key decisions:</h3>
 * <ul>
 *   <li><b>CSRF disabled</b> — we use stateless JWT tokens; CSRF protection is
 *       only needed for session-based (cookie) authentication.</li>
 *   <li><b>Stateless sessions</b> — {@code STATELESS} session policy tells Spring
 *       Security not to create or use HTTP sessions.</li>
 *   <li><b>Public endpoints</b> — {@code /api/auth/**} is open (login, ping).
 *       The H2 console ({@code /h2-console/**}) is also permitted for dev use.</li>
 *   <li><b>Protected endpoints</b> — all other routes require authentication.</li>
 *   <li><b>CORS</b> — delegates to the {@link CorsConfig} bean.</li>
 * </ul>
 *
 * <p>When you add JWT filter-based route protection, inject a
 * {@code JwtAuthenticationFilter} and add it with
 * {@code .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)}.</p>
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    /**
     * Main security filter chain — defines authorization rules.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── CORS ─────────────────────────────────────────────────────────
            // Must be configured BEFORE authorization rules.
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // ── CSRF ─────────────────────────────────────────────────────────
            // Disabled because we use stateless JWT tokens, not cookies.
            .csrf(AbstractHttpConfigurer::disable)

            // ── Session Management ────────────────────────────────────────────
            // STATELESS: Spring Security will never create or use an HTTP session.
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Authorization Rules ───────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                    // Public: login endpoint + health check
                    .requestMatchers("/api/auth/**").permitAll()
                    // Public: H2 console for development (remove in production)
                    .requestMatchers("/h2-console/**").permitAll()
                    // All other requests must be authenticated
                    .anyRequest().authenticated()
            )

            // ── H2 Console frame support ──────────────────────────────────────
            // H2 console uses HTML frames; we need to relax the X-Frame-Options header.
            .headers(headers ->
                    headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    /**
     * BCryptPasswordEncoder bean — used by {@link DataInitializer} to hash
     * seed passwords and by {@link com.hotelgrande.erp.service.UserService}
     * to verify login credentials.
     *
     * <p>BCrypt automatically generates a random salt and includes it in the
     * hash — so two users with the same password will have different hashes.</p>
     *
     * @return a {@link BCryptPasswordEncoder} with default strength (10 rounds)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
