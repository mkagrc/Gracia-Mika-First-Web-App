package edu.bsit.garcia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Credentials supplied to the login endpoint. */
public record LoginRequest(
        @Email(message = "Email must be valid") @NotBlank(message = "Email is required") String email,
        @NotBlank(message = "Password is required") String password) {
}
