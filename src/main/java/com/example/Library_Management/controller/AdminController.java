package com.example.Library_Management.controller;

import com.example.Library_Management.dto.LoanRequest;
import com.example.Library_Management.model.Book;
import com.example.Library_Management.model.Loan;
import com.example.Library_Management.service.BookService;
import com.example.Library_Management.service.DataIngestionService;
import com.example.Library_Management.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@PreAuthorize("hasRole('ROLE_ADMIN')")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private BookService bookService;

    @Autowired
    private LoanService loanService;

    @Autowired
    private DataIngestionService dataIngestionService;

    @PostMapping("/books")
    public Book createBook(@RequestBody Book book) {
        book.setAvailableCopies(book.getTotalCopies());
        return bookService.save(book);
    }

    @GetMapping("/loans")
    public List<Loan> getAllActiveLoans() {
        return loanService.getActiveLoans();
    }

    @PostMapping("/lend")
    public Loan lendBook(@RequestBody LoanRequest request) {
        return loanService.lendBook(request.getBookId(), request.getUserId(), request.getDurationDays());
    }

    @PostMapping("/return/{loanId}")
    public Loan returnBook(@PathVariable Long loanId) {
        return loanService.returnBook(loanId);
    }

    @PostMapping("/data/ingest")
    public String ingestData(@RequestParam String dataPath) throws Exception {
        dataIngestionService.ingestData(dataPath);

        return "Data ingestion completed";
    }
}
