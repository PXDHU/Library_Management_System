package com.example.Library_Management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Library_Management.model.Book;
import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthor(String author);
    List<Book> findByPublisher(String publisher);
    Optional<Book> findByIsbn(String isbn);

}
