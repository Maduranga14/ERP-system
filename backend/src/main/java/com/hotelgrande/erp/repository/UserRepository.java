package com.hotelgrande.erp.repository;

import com.hotelgrande.erp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository — Spring Data JPA repository for the {@link User} entity.
 *
 * <p>Spring Data automatically provides standard CRUD operations via
 * {@link JpaRepository}. We only need to declare our custom query method:
 * {@link #findByEmail(String)} — used by the authentication flow.</p>
 *
 * <p>No implementation class is needed; Spring Data generates a proxy at
 * runtime based on the method name convention.</p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Looks up a user by their email address (the login identifier).
     *
     * <p>Spring Data translates this method name into the JPQL query:
     * {@code SELECT u FROM User u WHERE u.email = :email}</p>
     *
     * @param email the email address to search for (case-sensitive)
     * @return an {@link Optional} containing the user if found, or empty
     */
    Optional<User> findByEmail(String email);
}
