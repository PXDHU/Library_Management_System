package com.example.Library_Management.service;

import com.example.Library_Management.model.Book;
import com.example.Library_Management.model.Rating;
import com.example.Library_Management.repository.BookRepository;
import com.example.Library_Management.repository.RatingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
public class DataIngestionService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private RatingRepository ratingRepository;

    private static final int RECORD_LIMIT = 1000;
    private static final int MAX_LINES = 10000;

    public void ingestData(String filePath) throws Exception {
        Set<String> uniqueIsbns = new HashSet<>();
        int bookCount = 0;
        int ratingCount = 0;
        int lineNumber = 0;

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            br.readLine(); // Skip header
            while ((line = br.readLine()) != null && lineNumber <= MAX_LINES) {
                lineNumber++;
                String[] data = line.split(";", -1);

                if (data.length >= 6) {
                    try {
                        String isbn = clean(data[0]);
                        String ratingStr = clean(data[1]);
                        String title = data[2].isBlank() ? "Unknown" : data[2].trim();
                        String author = data[3].isBlank() ? "Other" : data[3].trim();
                        String yearStr = clean(data[4]);
                        String publisher = data[5].isBlank() ? "Other" : data[5].trim();

                        // Save Book
                        Book book = bookRepository.findByIsbn(isbn).orElse(null);
                        if (book == null && bookCount < RECORD_LIMIT) {
                            book = new Book();
                            book.setIsbn(isbn);
                            book.setTitle(title);
                            book.setAuthor(author);
                            book.setYear(yearStr.matches("\\d+") ? Integer.parseInt(yearStr) : 0);
                            book.setPublisher(publisher);
                            book.setTotalCopies(10);
                            book.setAvailableCopies(10);
                            book = bookRepository.save(book);
                            bookCount++;
                        }

                        // Save Rating
                        if (book != null && ratingCount < RECORD_LIMIT) {
                            Rating rating = new Rating();
                            rating.setBook(book);
                            rating.setRating(Integer.parseInt(ratingStr));
                            ratingRepository.save(rating);
                            ratingCount++;
                        }

                    } catch (Exception ex) {
                        log.warn("Skipping invalid record at line {}: {} (Error: {})", lineNumber, line, ex.getMessage());
                    }
                } else {
                    log.warn("Malformed line at {}: {}", lineNumber, line);
                }
            }
            if (lineNumber > MAX_LINES) {
                log.warn("Stopped processing at max line limit: {}", MAX_LINES);
            }

            log.info("Ingested {} books and {} ratings successfully.", bookCount, ratingCount);
        } catch (Exception e) {
            log.error("Error processing file: {}", filePath, e);
            throw new Exception("Error processing file: " + filePath, e);
        }
    }

    private String clean(String input) {
        return input == null ? "" : input.replaceAll("[\"']", "").trim();
    }
}
