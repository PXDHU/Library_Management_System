package com.example.Library_Management.controller;

import com.example.Library_Management.model.Book;
import com.example.Library_Management.service.BookService;
import com.example.Library_Management.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private RecommendationService recommendationService;


    @GetMapping
    public List<Book> getAllBooks(@RequestParam(required = false) String title) {
        return title != null ? bookService.searchBooks(title) : bookService.getAllBooks();
    }

    @GetMapping("/popular")
    public List<String> getPopularBooks() {
        return recommendationService.getPopularBooks();
    }

    @GetMapping("/{isbn}/recommendations/content-based")
    public List<String> getContentBasedRecommendations(@PathVariable String isbn) {
        return recommendationService.getContentBasedRecommendations(isbn);
    }
}
