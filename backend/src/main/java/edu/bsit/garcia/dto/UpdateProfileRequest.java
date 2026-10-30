package edu.bsit.garcia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Editable account profile fields; email, role, and password are not client-controlled. */
public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required")
        String fullName,
        @Size(max = 255, message = "Address must be at most 255 characters")
        String address,
        @Size(max = 20, message = "Phone must be at most 20 characters")
        @Pattern(regexp = "^[0-9+\\- ]*$", message = "Phone may contain only digits, +, - and spaces")
        String phone,
        @Size(max = 1_398_128, message = "Profile picture must be no larger than 1 MB")
        @Pattern(regexp = "^(data:image/(jpeg|png);base64,[A-Za-z0-9+/]*={0,2})?$",
                message = "Profile picture must be a Base64 JPEG or PNG data URL")
        String profilePicture) {
}
