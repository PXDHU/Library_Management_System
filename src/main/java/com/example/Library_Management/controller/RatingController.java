package com.example.Library_Management.controller;

import com.example.Library_Management.model.Rating;
import com.example.Library_Management.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:3000/")
public class RatingController {
    @Autowired
    private RatingService ratingService;

    @PostMapping("/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> rateBook(@PathVariable Long bookId, @RequestParam Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
        }
        try {
            Rating savedRating = ratingService.rateBook(bookId, rating);
            return ResponseEntity.ok(savedRating);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to rate book: " + e.getMessage());
        }
    }

    @GetMapping("/averages")
    public ResponseEntity<java.util.Map<Long, Double>> getAverageRatingsForAllBooks() {
        return ResponseEntity.ok(ratingService.getAverageRatingsForAllBooks());
    }
} 