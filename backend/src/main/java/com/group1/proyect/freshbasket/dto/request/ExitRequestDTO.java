package com.group1.proyect.freshbasket.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para recibir datos de una entrada (sin ID)")
public class ExitRequestDTO {

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @NotNull(message = "La cantidad es obligatoria")
    @Schema(description = "Cantidad total de la salida", example = "50")
    private Integer quantity;

    @Schema(description = "El nombre del producto", example = "pollo indio")
    @NotNull(message = "El nombre del producto es obligatorio")
    private String productName;

    @Schema(description = "Nombre del usuario", example = "Juan Martinez")
    @NotNull(message = "El nombre del usuario es obligatorio")
    private String userName;
}
