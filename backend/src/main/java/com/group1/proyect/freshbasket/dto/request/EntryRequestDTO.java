package com.group1.proyect.freshbasket.dto.request;


import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para recibir datos de una entrada (sin ID)")
public class EntryRequestDTO {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(description = "Hora y fecha del registro de la entrada", example = "20/05/2026 12:30")
    private LocalDateTime entryDate;

    @NotNull(message = "El costo unitario es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El costo unitario debe ser mayor a 0")
    @Schema(description = "Precio de cada producto en la entrada", example = "manzanas = 0.50")
    private BigDecimal unitCost;

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Schema(description = "Cantidad total de la entrada", example = "500")
    private Integer quantity;

    @Schema(description = "El nombre del producto", example = "pollo indio")
    @NotNull(message = "El nombre del producto es obligatorio")
    private String productName;

    @Schema(description = "El nombre del proveedor", example = "Distribuidora del monte")
    @NotNull(message = "El nombre del proveedor es obligatorio")
    private String supplierName;

    @Schema(description = "Nombre del usuario", example = "Juan Martinez")
    @NotNull(message = "El nombre del usuario es obligatorio")
    private String userName;
}