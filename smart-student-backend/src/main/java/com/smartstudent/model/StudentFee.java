package com.smartstudent.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_fees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "amount_due", nullable = false)
    private Double amountDue;

    @Column(name = "amount_paid")
    private Double amountPaid = 0.0;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    @Column(name = "receipt_no", unique = true, length = 50)
    private String receiptNo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.PENDING;

    @Column(name = "academic_year", length = 10)
    private String academicYear;

    public enum Status { PENDING, PAID, PARTIAL, WAIVED }
}
