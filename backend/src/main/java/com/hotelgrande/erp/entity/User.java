package com.hotelgrande.erp.entity;

import com.hotelgrande.erp.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * JPA Entity representing a Hotel Grande ERP system user.
 *
 * <p>Implements {@link UserDetails} so it can be directly used by Spring
 * Security's authentication pipeline without any adapter class.</p>
 *
 * <p>Schema (auto-created by Hibernate on startup):</p>
 * <pre>
 *   TABLE users
 *     id            BIGINT          PK, auto-generated
 *     full_name     VARCHAR(100)    NOT NULL
 *     email         VARCHAR(150)    NOT NULL, UNIQUE
 *     password_hash VARCHAR(255)    NOT NULL  (BCrypt)
 *     role          VARCHAR(20)     NOT NULL  (ADMIN|MANAGER|RECEPTIONIST|HOUSEKEEPER)
 *     enabled       BOOLEAN         NOT NULL  DEFAULT TRUE
 *     created_at    TIMESTAMP       NOT NULL
 * </pre>
 */
@Entity
@Table(name = "users")
@Data                   // Lombok: generates getters, setters, toString, equals, hashCode
@Builder                // Lombok: builder pattern for easy object creation
@NoArgsConstructor      // Lombok: required by JPA
@AllArgsConstructor     // Lombok: required by @Builder
public class User implements UserDetails {

    // ── Primary Key ──────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── User Profile Fields ───────────────────────────────────────────────────

    /** Display name (e.g. "John Smith") shown in the dashboard header. */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    /** Unique email used as the login identifier. */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * BCrypt-hashed password. NEVER store or log the raw password.
     * Use {@code BCryptPasswordEncoder.matches(raw, hash)} to verify.
     */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /**
     * The user's role in the system.
     * Stored as a String column (e.g. "ADMIN") for readability in the DB.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /** Soft disable an account without deleting it. */
    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    /** Audit timestamp — set automatically before first persist. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Lifecycle Callback ────────────────────────────────────────────────────

    /** Automatically sets createdAt before the entity is persisted. */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── UserDetails Implementation ────────────────────────────────────────────
    // Spring Security reads these methods to authenticate and authorize users.

    /**
     * Returns the role as a Spring Security GrantedAuthority.
     * The "ROLE_" prefix is required by Spring Security's hasRole() method.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /**
     * Spring Security uses getPassword() to verify credentials.
     * We return our BCrypt hash here.
     */
    @Override
    public String getPassword() {
        return passwordHash;
    }

    /**
     * Spring Security uses getUsername() as the principal identifier.
     * We use email as the unique login key.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /** Account is never time-limited in this system. */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /** Account is never locked by default (extend for brute-force protection). */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /** Credentials never expire (extend for password-rotation policy). */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /** Delegates to the {@link #enabled} field for soft-disable support. */
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
