package com.example.Library_Management.repository;

import com.example.Library_Management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}