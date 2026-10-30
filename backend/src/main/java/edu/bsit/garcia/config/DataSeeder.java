package edu.bsit.garcia.config;

import edu.bsit.garcia.model.User;
import edu.bsit.garcia.repository.UserRepository;
import edu.bsit.garcia.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Adds the documented classroom ADMIN account to a fresh in-memory database. */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final String ADMIN_EMAIL = "admin@userhub.com";
    private static final String ADMIN_PASSWORD = "admin12345";

    private final UserRepository userRepository;

    public DataSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) return;
        User admin = new User();
        admin.setFullName("System Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(UserService.hashPassword(ADMIN_PASSWORD));
        admin.setRole("ADMIN");
        userRepository.save(admin);
        System.out.println("Seeded UserHub ADMIN: " + ADMIN_EMAIL + " / " + ADMIN_PASSWORD);
    }
}
