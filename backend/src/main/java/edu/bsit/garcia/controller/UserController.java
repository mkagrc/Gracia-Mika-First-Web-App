package edu.bsit.garcia.controller;

import edu.bsit.garcia.dto.UpdateProfileRequest;
import edu.bsit.garcia.dto.UserResponse;
import edu.bsit.garcia.model.User;
import edu.bsit.garcia.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Profile operations for the currently authenticated user. */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/me")
    public UserResponse updateMyProfile(
            @RequestHeader(value = "Authorization", required = false) String header,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.authenticate(header);
        return userService.updateProfile(user, request);
    }
}
