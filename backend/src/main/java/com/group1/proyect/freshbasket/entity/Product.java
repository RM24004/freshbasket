package com.group1.proyect.freshbasket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_product") //en la base de datos es product_id
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin("0.0")
    @Column(nullable = false)
    private BigDecimal price;

    @Min(0)
    @NotNull(message = "La cantidad es obligatorio")
    @Column(nullable = false)
    private Integer currentStock;

    @Size(max = 500)
    @NotBlank(message = "La descripcion es obligatoria")
    private String description;

    // Imagen del producto se guarda la url 
    @Size(max = 500)
    @NotBlank(message = "La imagen es obligatoria")
    @Column(name = "image_url")
    private String imageUrl;

    // Relación con Categoría
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // Relación con Proveedor
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;
}

    