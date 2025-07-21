package com.example.Library_Management.dto;
import lombok.Data;

@Data
public class LoanRequest {
    private Long bookId;
    private Long userId;
    private Integer durationDays; // number of days for loan
}