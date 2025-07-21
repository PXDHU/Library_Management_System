package com.example.Library_Management.service;

import com.example.Library_Management.model.Book;
import com.example.Library_Management.model.Rating;
import com.example.Library_Management.repository.BookRepository;
import com.example.Library_Management.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashSet;
import java.util.Set;

@Service
public class DataIngestionService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private RatingRepository ratingRepository;

    private static final int RECORD_LIMIT = 1000; // For books and ratings
    private static final int MAX_LINES = 10000; // Prevent infinite loops

    public void ingestData(String filePath) throws Exception {
        Set<String> uniqueIsbns = new HashSet<>();
        int bookCount = 0;
        int ratingCount = 0;

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            br.readLine(); // Skip header
            int lineNumber = 1;
            while ((line = br.readLine()) != null && lineNumber <= MAX_LINES) {
                lineNumber++;
                String[] data = line.split(";", -1);
                if (data.length >= 8) {
                    try {
                        // Extract and clean fields
                        String isbn = data[1].replaceAll("[\"']", "").trim();
                        String ratingStr = data[2].replaceAll("[\"']", "").trim();
                        String title = data[3].isEmpty() ? "Unknown" : data[3].trim();
                        String author = data[4].isEmpty() ? "Other" : data[4].trim();
                        String yearStr = data[5].replaceAll("[\"']", "").trim();
                        String publisher = data[6].isEmpty() ? "Other" : data[6].trim();

                        // -- Handle Book
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

                        // -- Handle Rating (no need to associate with User-ID)
                        if (book != null && ratingCount < RECORD_LIMIT) {
                            Rating rating = new Rating();
                            rating.setBook(book);
                            rating.setRating(Integer.parseInt(ratingStr));
                            ratingRepository.save(rating);
                            ratingCount++;
                        }

                    } catch (NumberFormatException e) {
                        System.err.println("Skipping invalid record at line " + lineNumber + ": " + line + " (Error: " + e.getMessage() + ")");
                    }
                }
            }

            if (lineNumber > MAX_LINES) {
                System.err.println("Stopped processing CSV at line " + lineNumber + " due to maximum line limit (" + MAX_LINES + ")");
            }

            System.out.println("Ingested " + bookCount + " books.");
            System.out.println("Ingested " + ratingCount + " ratings.");
        } catch (Exception e) {
            throw new Exception("Error processing file: " + filePath, e);
        }
    }
}
