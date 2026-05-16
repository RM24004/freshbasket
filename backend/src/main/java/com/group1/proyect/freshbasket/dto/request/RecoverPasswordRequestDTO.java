package com.group1.proyect.freshbasket.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecoverPasswordRequestDTO {
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de email invalido")
    private String email;
}