package com.group1.proyect.freshbasket.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para enviar datos del proveedor (con ID y relaciones)")
public class SupplierResponseDTO {

    @Schema(description = "ID del proveedor", example = "1")
    private Long id;

    @Schema(description = "Nombre del proveedor", example = "Jurídico o natural = Importadora Del Campo")
    private String name;

    @Schema(description = "Apellidos del proveedor", example = "SA de CV o apellidos de persona natural")
    private String lastName;

    @Schema(description = "Teléfono de contacto del proveedor", example = "2300-3476")
    private String phone;

    @Schema(description = "E-mail del usuario", example = "distribuidora.delcampo@mail.com")
    private String email;

    @Schema(description = "Dirección del proveedor", example = "Av. las Amapolas #102, San Salvador")
    private String address;

    @Schema(description = "ID del país", example = "1")
    private Long countryId;
}
