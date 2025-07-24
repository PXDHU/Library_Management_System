package com.example.Library_Management.controller;

import com.example.Library_Management.dto.EmailRequest;
import com.example.Library_Management.dto.LoanRequest;
import com.example.Library_Management.model.Book;
import com.example.Library_Management.model.Loan;
import com.example.Library_Management.service.BookService;
import com.example.Library_Management.service.DataIngestionService;
import com.example.Library_Management.service.EmailService;
import com.example.Library_Management.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000/")
public class AdminController {

    @Autowired
    private BookService bookService;

    @Autowired
    private LoanService loanService;

    @Autowired
    private DataIngestionService dataIngestionService;

    @PostMapping("/books")
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        if (book.getTitle() == null || book.getTitle().isEmpty() ||
            book.getAuthor() == null || book.getAuthor().isEmpty() ||
            book.getTotalCopies() == null || book.getTotalCopies() <= 0) {
            return ResponseEntity.badRequest().body("Invalid book data");
        }
        if (!isValidIsbn(book.getIsbn())) {
            return ResponseEntity.badRequest().body("ISBN must be 10 or 13 digits.");
        }
        if (!isValidYear(book.getYear())) {
            return ResponseEntity.badRequest().body("Year must be a 4-digit number between 1000 and the current year.");
        }
        try {
            book.setAvailableCopies(book.getTotalCopies());
            Book savedBook = bookService.save(book);
            return ResponseEntity.ok(savedBook);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create book: " + e.getMessage());
        }
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Book updatedBook) {
        if (!isValidIsbn(updatedBook.getIsbn())) {
            return ResponseEntity.badRequest().body("ISBN must be 10 or 13 digits.");
        }
        if (!isValidYear(updatedBook.getYear())) {
            return ResponseEntity.badRequest().body("Year must be a 4-digit number between 1000 and the current year.");
        }
        try {
            Book book = bookService.getBookById(id);
            // Update fields
            book.setTitle(updatedBook.getTitle());
            book.setAuthor(updatedBook.getAuthor());
            book.setIsbn(updatedBook.getIsbn());
            book.setYear(updatedBook.getYear());
            book.setPublisher(updatedBook.getPublisher());
            book.setTotalCopies(updatedBook.getTotalCopies());
            // Adjust availableCopies if totalCopies changed
            int diff = updatedBook.getTotalCopies() - book.getTotalCopies();
            book.setAvailableCopies(book.getAvailableCopies() + diff);
            Book savedBook = bookService.save(book);
            return ResponseEntity.ok(savedBook);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update book: " + e.getMessage());
        }
    }

    private boolean isValidIsbn(String isbn) {
        return isbn != null && (isbn.matches("\\d{10}") || isbn.matches("\\d{13}"));
    }
    private boolean isValidYear(Integer year) {
        if (year == null) return false;
        int currentYear = java.time.Year.now().getValue();
        return year >= 1000 && year <= currentYear;
    }

    @GetMapping("/loans")
    public List<Loan> getAllActiveLoans() {
        return loanService.getActiveLoans();
    }

    @PostMapping("/lend")
    public ResponseEntity<?> lendBook(@RequestBody LoanRequest request) {
        if (request.getBookId() == null || request.getUserId() == null || request.getDurationDays() <= 0) {
            return ResponseEntity.badRequest().body("Invalid loan request");
        }
        try {
            Loan loan = loanService.lendBook(request.getBookId(), request.getUserId(), request.getDurationDays());
            return ResponseEntity.ok(loan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to lend book: " + e.getMessage());
        }
    }

    @PostMapping("/return/{loanId}")
    public Loan returnBook(@PathVariable Long loanId) {
        return loanService.returnBook(loanId);
    }

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-email")
    public ResponseEntity<?> sendEmail(@RequestBody EmailRequest emailRequest) {
        if (emailRequest.getTo() == null || emailRequest.getTo().isEmpty() ||
            emailRequest.getSubject() == null || emailRequest.getSubject().isEmpty() ||
            emailRequest.getBody() == null || emailRequest.getBody().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid email request");
        }
        try {
            emailService.sendEmail(emailRequest.getTo(), emailRequest.getSubject(), emailRequest.getBody());
            return ResponseEntity.ok("Email sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/data/ingest")
    public ResponseEntity<String> ingestData(@RequestParam String dataPath) {
        try {
            dataIngestionService.ingestData(dataPath);
            return ResponseEntity.ok("Data ingestion completed.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to ingest data: " + e.getMessage());
        }
    }

    @PostMapping("/notify-overdue")
    public ResponseEntity<String> notifyOverdueLoans() {
        loanService.checkAndNotifyOverdueLoans();
        return ResponseEntity.ok("Overdue notifications sent (if any overdue loans exist).");
    }
}
