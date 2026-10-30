package edu.bsit.garcia.repository;

import edu.bsit.garcia.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database operations for User records. */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
