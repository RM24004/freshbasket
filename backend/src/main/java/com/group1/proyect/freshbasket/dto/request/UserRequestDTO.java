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
@Schema(description = "DTO para recibir datos de un USUARIO (sin ID)")
public class UserRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    @Schema(description = "Nombre del usuario", example = "Martin Antonio")
    private String name;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    @Schema(description = "Apellidos del usuario", example = "Hernandez Verdugo")
    private String lastName;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email invalido")
    @Column(unique = true, nullable = false)
    @Schema(description = "E-mail del usuario", example = "elbaby.lindo@mail.com")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20)
    @Column(length = 20)
    @Schema(description = "Teléfono de contacto del usuario", example = "8080-9000 o 23003476")
    private String phone;

    @Column(nullable = false)
    @Schema(description = "Rol del usuario", example = "ADMINISTRADOR, USUARIO, SOPORTE")
    private String role;

    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    @Schema(description = "Contraseña del usuario", example = "JDPEOD34#&TEmxr")
    private String password;

    @NotNull(message = "El nombre del país es obligatorio")
    @Schema(description = "Nombre del país", example = "El Salvador")
    private String countryName;

}
