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
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_supplier") //en la base de datos esta supplier_id
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    // Persona de contacto (opcional, mejor que lastName)
    @Size(max = 100)
    @NotBlank(message = "El contacto es obligatorio")
    @Column(length = 100)
    private String contact; // en la base de datos no hay un campo llamado contact

    @Size(max = 15)
    @NotBlank(message = "El telefono es obligatorio")
    @Column(length = 15)
    private String phone;

    @NotBlank(message = "La email es obligatoria")
    @Email(message = "Formato de email inválido")
    @Size(max = 100)
    @Column(length = 100)
    private String email;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String address;

    //Relacion con paises ya que un pais tiene muchos proveedores
    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;

    // Relación 1:N: Un proveedor tiene muchos productos
    @OneToMany(mappedBy = "supplier", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> products = new ArrayList<>();

    // Relación 1:N: Un proveedor tiene muchas entradas
    @OneToMany(mappedBy = "supplier", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Entry> entries = new ArrayList<>();
}