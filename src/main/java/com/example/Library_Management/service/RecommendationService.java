package com.example.Library_Management.service;

import com.example.Library_Management.model.Book;
import com.example.Library_Management.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private BookRepository bookRepository;

    private final String PYTHON_API_URL = "http://localhost:8000";

    public List<String> getPopularBooks() {
        return restTemplate.getForObject(PYTHON_API_URL + "/popular", List.class);
    }

    public List<String> getContentBasedRecommendations(String isbn) {
        Book book = bookRepository.findByIsbn(isbn).orElseThrow(() -> new RuntimeException("Book not found"));
        return restTemplate.getForObject(PYTHON_API_URL + "/content-based/" + book.getIsbn(), List.class);
    }
}
