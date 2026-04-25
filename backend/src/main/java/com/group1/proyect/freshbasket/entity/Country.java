package com.group1.proyect.freshbasket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "countries")
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_country") //en la base de datos lo deje como country_id
    private Long id;

    @NotBlank(message = "El nombre del país es obligatorio")
    @Size(max = 100)
    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @NotBlank(message = "La Descripcion del país es obligatorio")
    @Size(max = 100)
    @Column(length = 100, unique = true)
    private String description; // Ej: SV, US, MX

    // Relación 1:N: Un país tiene muchos proveedores
    @OneToMany(mappedBy = "country", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Supplier> suppliers = new ArrayList<>();
}