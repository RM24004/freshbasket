package com.group1.proyect.freshbasket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para recibir datos de un producto (sin ID)")
public class ProductRequestDTO {

    @Schema(description = "Nombre del producto", example = "Manzana Roja")
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @Schema(description = "Precio del producto", example = "0.50")
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio debe ser mayor o igual a 0")
    private BigDecimal price;

    @Schema(description = "Stock disponible", example = "150")
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock debe ser mayor o igual a 0")
    private Integer currentStock;

    @Schema(description = "Descripción del producto", example = "Manzana fresca importada")
    private String description;

    //URL de la imagen
    @Schema(description = "URL de la imagen del producto", example = "https://miapp.com/img/manzana.jpg")
    private String imageUrl;

    @Schema(description = "ID de la categoría", example = "1")
    @NotNull(message = "El ID de la categoría es obligatorio")
    private Long categoryId;

    @Schema(description = "ID del proveedor", example = "1")
    @NotNull(message = "El ID del proveedor es obligatorio")
    private Long supplierId;
}