package com.example.Library_Management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Store the User-ID from the CSV directly

    private String username;
    private String fullName;
    private String email;
    private String password;
    private String role; // ROLE_ADMIN or ROLE_EMPLOYEE
}