package edu.bsit.garcia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Starts the UserHub API and its embedded H2 database. */
@SpringBootApplication
public class UserHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserHubApplication.class, args);
    }
}
