package edu.bsit.garcia.dto;

import java.time.LocalDateTime;

/** Public account view; never add password or password-hash fields here. */
public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String address,
        String phone,
        String profilePicture,
        LocalDateTime createdAt) {
}
