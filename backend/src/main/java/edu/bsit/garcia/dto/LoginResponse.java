package edu.bsit.garcia.dto;

/** Authentication result returned after successful login. */
public record LoginResponse(String token, UserResponse user) {
}
