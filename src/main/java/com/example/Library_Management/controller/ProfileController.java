package com.example.Library_Management.controller;

import com.example.Library_Management.model.User;
import com.example.Library_Management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000/")
public class ProfileController {
    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    // Fetch authenticated user's profile
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getProfile(Principal principal) {
        logger.info("/api/profile called by principal: {}", principal.getName());
        User user = userService.getUserByUsername(principal.getName());
        logger.info("User fetched: {}", user);
        return ResponseEntity.ok(user);
    }

    // Update authenticated user's profile
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser, Principal principal) {
        User currentUser = userService.getUserByUsername(principal.getName());
        // Only allow updating fullName, email, and password
        currentUser.setFullName(updatedUser.getFullName());
        currentUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            currentUser.setPassword(updatedUser.getPassword());
        }
        User savedUser = userService.updateUser(currentUser.getId(), currentUser);
        return ResponseEntity.ok(savedUser);
    }
} 