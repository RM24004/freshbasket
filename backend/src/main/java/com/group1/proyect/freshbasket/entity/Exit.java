package com.group1.proyect.freshbasket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "exits")
public class Exit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_exit") //en la base de datos yo lo deje como exit_id
    private Long id;

    @Min(1)
    @NotBlank(message = "El valor es obligatorio")
    @Column(nullable = false)
    private Integer quantity;

    @NotBlank(message = "La fecha es obligatoria")
    @Column(name = "exit_date", nullable = false, updatable = false)
    private LocalDateTime exitDate;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        exitDate = LocalDateTime.now();
    }
}