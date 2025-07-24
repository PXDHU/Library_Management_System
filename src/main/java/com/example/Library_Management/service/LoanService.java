package com.example.Library_Management.service;
import com.example.Library_Management.model.Book;
import com.example.Library_Management.model.Loan;
import com.example.Library_Management.model.User;
import com.example.Library_Management.repository.BookRepository;
import com.example.Library_Management.repository.LoanRepository;
import com.example.Library_Management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public Loan lendBook(Long bookId, Long userId, int durationDays) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No available copies for this book");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan loan = new Loan();
        loan.setBook(book);
        loan.setUser(user);
        loan.setLoanDate(LocalDateTime.now());
        loan.setDueDate(LocalDateTime.now().plusDays(durationDays));

        return loanRepository.save(loan);
    }

    public Loan returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));

        if (loan.getReturnDate() != null) {
            throw new RuntimeException("Book already returned");
        }

        loan.setReturnDate(LocalDateTime.now());

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return loanRepository.save(loan);
    }

    public List<Loan> getActiveLoans() {
        return loanRepository.findByReturnDateIsNull();
    }

    public Loan getLoanById(Long loanId) {
        return loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    public List<Loan> getLoansByUser(Long userId) {
        return loanRepository.findAll().stream()
            .filter(l -> l.getUser().getId().equals(userId))
            .toList();
    }

    @Scheduled(cron = "0 0 8 * * *") // Every day at 8 AM
    public void scheduledOverdueNotification() {
        checkAndNotifyOverdueLoans();
    }

    public void checkAndNotifyOverdueLoans() {
        List<Loan> overdueLoans = loanRepository.findByDueDateBeforeAndReturnDateIsNull(LocalDateTime.now());
        for (Loan loan : overdueLoans) {
            User user = loan.getUser();
            if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                String subject = "Library Book Overdue Notice";
                String body = String.format("Dear %s,\n\nYour loan for the book '%s' (ID: %d) is overdue. Please return it as soon as possible.\n\nThank you!\nLibrary Management System",
                    user.getFullName() != null ? user.getFullName() : user.getUsername(),
                    loan.getBook().getTitle(),
                    loan.getBook().getId()
                );
                emailService.sendEmail(user.getEmail(), subject, body);
            }
        }
    }
}
