package com.smartstudent.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "professors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "employee_id", nullable = false, unique = true, length = 20)
    private String employeeId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 15)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(length = 80)
    private String designation;

    @Column(length = 120)
    private String qualification;

    @Column(name = "profile_photo", length = 300)
    private String profilePhoto;
}
