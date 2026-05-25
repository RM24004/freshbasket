package com.group1.proyect.freshbasket.dto.request;
import lombok.Data;

@Data
public class AuthRequestDTO {
    private String email;
    private String password;
    private String role;
}
