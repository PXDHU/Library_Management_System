package com.example.Library_Management.model;

import jakarta.persistence.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "text")
    private String title;

    @Column(columnDefinition = "text")
    private String author;

    @Column(columnDefinition = "text")
    private String isbn;

    private Integer year;

    @Column(columnDefinition = "text")
    private String publisher;

    private Integer totalCopies;
    private Integer availableCopies;
}
