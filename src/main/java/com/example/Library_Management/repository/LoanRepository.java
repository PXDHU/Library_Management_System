package com.example.Library_Management.repository;

import com.example.Library_Management.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByReturnDateIsNull(); // Active loans
    List<Loan> findByDueDateBeforeAndReturnDateIsNull(java.time.LocalDateTime now);
}