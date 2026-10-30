package edu.bsit.garcia.dto;

import java.time.LocalDateTime;

/** Account summary and profile details displayed on the authenticated dashboard. */
public record DashboardResponse(
        String fullName,
        String email,
        String role,
        String address,
        String phone,
        String profilePicture,
        LocalDateTime memberSince,
        long totalUsers) {
}
