package com.example.Library_Management.controller;

import com.example.Library_Management.model.Loan;
import com.example.Library_Management.model.User;
import com.example.Library_Management.service.LoanService;
import com.example.Library_Management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:3000/")
public class LoanController {
    @Autowired
    private LoanService loanService;
    @Autowired
    private UserService userService;

    @PostMapping("/borrow/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Loan> borrowBook(@PathVariable Long bookId, @RequestParam(defaultValue = "14") int durationDays, Principal principal) {
        Long userId = userService.listUsers().stream()
            .filter(u -> u.getUsername().equals(principal.getName()))
            .findFirst().orElseThrow(() -> new RuntimeException("User not found")).getId();
        return ResponseEntity.ok(loanService.lendBook(bookId, userId, durationDays));
    }

    @PostMapping("/return/{loanId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Loan> returnBook(@PathVariable Long loanId, Principal principal) {
        Long userId = userService.listUsers().stream()
            .filter(u -> u.getUsername().equals(principal.getName()))
            .findFirst().orElseThrow(() -> new RuntimeException("User not found")).getId();
        Loan loan = loanService.getLoanById(loanId);
        if (!loan.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(loanService.returnBook(loanId));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Loan>> getMyLoans(Principal principal) {
        Long userId = userService.listUsers().stream()
            .filter(u -> u.getUsername().equals(principal.getName()))
            .findFirst().orElseThrow(() -> new RuntimeException("User not found")).getId();
        return ResponseEntity.ok(loanService.getLoansByUser(userId));
    }
} 