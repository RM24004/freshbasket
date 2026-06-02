package com.group1.proyect.freshbasket.dto.response;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para enviar datos de la entrada (con ID y relaciones)")
public class EntryResponseDTO {

    @Schema(description = "ID de la entrada", example = "1")
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(description = "Hora y fecha del registro de la entrada", example = "20/05/2026 12:30")
    private LocalDateTime entryDate;

    @Schema(description = "Precio de cada producto en la entrada", example = "manzanas = 0.50")
    private BigDecimal unitCost;

    @Schema(description = "Cantidad total de la entrada", example = "500")
    private Integer quantity;

    @Schema(description = "ID del producto", example = "1")
    private Long productId;

    @Schema(description = "Nombre del producto", example = "Pollo indio")
    private String productName;

    @Schema(description = "ID del proveedor", example = "1")
    private Long supplierId;

    @Schema(description = "Nombre del proveedor", example = "Distribuidora El Campo")
    private String supplierName;

    @Schema(description = "ID del usuario", example = "1")
    private Long userId;

    @Schema(description = "Nombre del usuario", example = "Juan Martinez")
    private String userName;
} 
