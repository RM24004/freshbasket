package com.group1.proyect.freshbasket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para recibir datos de un proveedor (sin ID)")
public class SupplierRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    @Schema(description = "Nombre del proveedor", example = "Jurídico o natural = Importadora Del Campo")
    private String name;

    @Size(max = 100)
    @NotBlank(message = "El apellido es obligatorio")
    @Column(length = 100)
    @Schema(description = "Apellidos del proveedor", example = "SA de CV o apellidos de persona natural")
    private String lastName;

    @Size(max = 15)
    @NotBlank(message = "El teléfono es obligatorio")
    @Column(length = 15)
    @Schema(description = "Teléfono de contacto del proveedor", example = "2300-3476")
    private String phone;

    @NotBlank(message = "La email es obligatoria")
    @Email(message = "Formato de email inválido")
    @Size(max = 100)
    @Column(length = 100)
    @Schema(description = "E-mail del usuario", example = "distribuidora.delcampo@mail.com")
    private String email;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    @Schema(description = "Dirección del proveedor", example = "Av. las Amapolas #102, San Salvador")
    private String address;

    @NotNull(message = "El ID del pais es obligatorio")
    @Schema(description = "ID del país", example = "1")
    private Long countryId;

}
