package com.hotelgrande.erp.entity;

import com.hotelgrande.erp.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;


    @Column(nullable = false, unique = true, length = 150)
    private String email;


    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;


    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 20)
    @JsonIgnore
    private Role role;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "department", length = 50)
    private String department;

    @JsonProperty("role")
    @Column(name = "emp_role", length = 50)
    private String empRole;

    @Column(name = "shift", length = 50)
    private String shift;

    @JsonProperty("joinDate")
    @Column(name = "join_date", length = 20)
    private String joinDate;

    @Column(name = "username", length = 50)
    private String username;

    @Transient
    private String rawPassword;

    @JsonProperty("password")
    public void setPassword(String password) {
        this.rawPassword = password;
    }

    @JsonIgnore
    public String getRawPassword() {
        return this.rawPassword;
    }

    @JsonProperty("systemRole")
    public String getSystemRoleJson() {
        return role == null ? "none" : role.name().toLowerCase();
    }

    @JsonProperty("systemRole")
    public void setSystemRoleJson(String systemRole) {
        if (systemRole == null || systemRole.equalsIgnoreCase("none")) {
            this.role = null;
        } else {
            try {
                this.role = Role.valueOf(systemRole.toUpperCase());
            } catch (IllegalArgumentException e) {
                this.role = null;
            }
        }
    }


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
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }


    @Override
    @JsonIgnore
    public String getPassword() {
        return passwordHash;
    }


    @Override
    @JsonIgnore
    public String getUsername() {
        return email;
    }


    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }


    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }


    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
