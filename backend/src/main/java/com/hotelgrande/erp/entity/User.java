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


@Entity
@Table(name = "users")
@Data                   // Lombok: generates getters, setters, toString, equals, hashCode
@Builder                // Lombok: builder pattern for easy object creation
@NoArgsConstructor      // Lombok: required by JPA
@AllArgsConstructor     // Lombok: required by @Builder
public class User implements UserDetails {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;


    @Column(nullable = false, unique = true, length = 150)
    private String email;


    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;


    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;


    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;




    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }


    @Override
    public String getPassword() {
        return passwordHash;
    }


    @Override
    public String getUsername() {
        return email;
    }


    @Override
    public boolean isAccountNonExpired() {
        return true;
    }


    @Override
    public boolean isAccountNonLocked() {
        return true;
    }


    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
