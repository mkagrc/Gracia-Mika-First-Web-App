package edu.bsit.garcia.controller;

import edu.bsit.garcia.dto.DashboardResponse;
import edu.bsit.garcia.dto.UserResponse;
import edu.bsit.garcia.model.User;
import edu.bsit.garcia.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Protected dashboard and administrator account-list routes. */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {
    private final UserService userService;

    public DashboardController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public DashboardResponse dashboard(@RequestHeader(value = "Authorization", required = false) String header) {
        User user = userService.authenticate(header);
        return userService.dashboard(user);
    }

    @GetMapping("/users")
    public List<UserResponse> users(@RequestHeader(value = "Authorization", required = false) String header) {
        User user = userService.authenticate(header);
        userService.requireRole(user, "ADMIN");
        return userService.findAll();
    }
}
