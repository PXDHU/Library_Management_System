package com.example.Library_Management.controller;

import com.example.Library_Management.model.User;
import com.example.Library_Management.service.UserService;
import com.example.Library_Management.dto.LoginRequest;
import com.example.Library_Management.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000/")
public class UserController {
    @Autowired
    private UserService userService;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+\\-=]{6,}$");

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isEmpty() ||
            request.getPassword() == null || request.getPassword().isEmpty() ||
            request.getEmail() == null || request.getEmail().isEmpty() ||
            request.getFullName() == null || request.getFullName().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            return ResponseEntity.badRequest().body("Please enter a valid email address.");
        }
        if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters, contain at least one letter and one number.");
        }
        try {
            return ResponseEntity.ok(userService.register(request));
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("Username already exists")) {
                return ResponseEntity.badRequest().body("This username is already taken. Please choose another.");
            } else if (msg != null && msg.contains("Email already exists")) {
                return ResponseEntity.badRequest().body("This email is already registered. Please use another or login.");
            } else {
                return ResponseEntity.status(500).body("Registration failed. Please try again later.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed. Please try again later.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isEmpty() ||
            request.getPassword() == null || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }
        if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters, contain at least one letter and one number.");
        }
        try {
            return ResponseEntity.ok(userService.login(request));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }
} 