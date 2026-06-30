package com.smartstudent.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internal_marks",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id", "ia_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternalMarks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "ia_number", nullable = false)
    private Short iaNumber; // 1, 2, or 3

    @Column(nullable = false)
    private Double marks;

    @Column(name = "max_marks")
    private Double maxMarks = 20.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", nullable = false)
    private Professor addedBy;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { addedAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
