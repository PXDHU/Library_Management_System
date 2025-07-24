package com.example.Library_Management.service;

import com.example.Library_Management.model.Book;
import com.example.Library_Management.model.Rating;
import com.example.Library_Management.repository.BookRepository;
import com.example.Library_Management.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;
    @Autowired
    private BookRepository bookRepository;

    public Rating rateBook(Long bookId, Integer ratingValue) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Find existing rating for the book
        Optional<Rating> existing = ratingRepository.findAll().stream()
                .filter(r -> r.getBook().getId().equals(bookId))
                .findFirst();

        Rating rating = existing.orElse(new Rating());
        rating.setBook(book);
        rating.setRating(ratingValue);

        return ratingRepository.save(rating);
    }

    public List<Rating> getRatingsForBook(Long bookId) {
        return ratingRepository.findAll().stream()
                .filter(r -> r.getBook().getId().equals(bookId))
                .toList();
    }

    public Optional<Rating> getBookRating(Long bookId) {
        return ratingRepository.findAll().stream()
                .filter(r -> r.getBook().getId().equals(bookId))
                .findFirst();
    }

    public Double getAverageRatingForBook(Long bookId) {
        List<Rating> ratings = getRatingsForBook(bookId);
        return ratings.isEmpty() ? null : ratings.stream().mapToInt(Rating::getRating).average().orElse(0.0);
    }

    public java.util.Map<Long, Double> getAverageRatingsForAllBooks() {
        java.util.Map<Long, Double> averages = new java.util.HashMap<>();
        bookRepository.findAll().forEach(book -> {
            Double avg = getAverageRatingForBook(book.getId());
            averages.put(book.getId(), avg != null ? avg : 0.0);
        });
        return averages;
    }
}
