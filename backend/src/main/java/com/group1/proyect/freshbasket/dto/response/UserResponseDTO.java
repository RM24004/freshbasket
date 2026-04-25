package com.group1.proyect.freshbasket.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para enviar datos del USUARIO (con ID y relaciones)")
public class UserResponseDTO {

    @Schema(description = "ID del producto", example = "1")
    private Long id;

    @Schema(description = "Nombre del usuario", example = "Martin Antonio")
    private String name;

    @Schema(description = "Apellidos del usuario", example = "Hernandez Verdugo")
    private String last_name;

    @Schema(description = "E-mail del usuario", example = "elbaby.lindo@mail.com")
    private String email;

    @Schema(description = "Telefono de contacto del usuario", example = "8080-9000 o 23003476")
    private String phone;

    @Schema(description = "Contraseña del usuario", example = "JDPEOD34#&TEmxr")
    private String password;


    @Schema(description = "ID del país", example = "1")
    private Long countryId;
}
