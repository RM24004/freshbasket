package com.group1.proyect.freshbasket.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.math.BigDecimal;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para enviar datos del producto al cliente (con ID y relaciones)")
public class ProductResponseDTO {

    @Schema(description = "ID del producto", example = "1")
    private Long id;

    @Schema(description = "Nombre del producto", example = "Manzana Roja")
    private String name;

    @Schema(description = "Precio del producto", example = "0.50")
    private BigDecimal price;

    @Schema(description = "Stock disponible", example = "150")
    private Integer currentStock;

    @Schema(description = "Descripción del producto", example = "Manzana fresca importada")
    private String description;

    // URL de la imagen del producto
    @Schema(description = "URL de la imagen del producto", example = "https://miapp.com/img/manzana.jpg")
    private String imageUrl;

    @Schema(description = "ID de la categoría", example = "1")
    private Long categoryId;

    @Schema(description = "Nombre de la categoría", example = "Frutas")
    private String categoryName;

    @Schema(description = "ID del proveedor", example = "1")
    private Long supplierId;

    @Schema(description = "Nombre del proveedor", example = "Distribuidora El Campo")
    private String supplierName;
}