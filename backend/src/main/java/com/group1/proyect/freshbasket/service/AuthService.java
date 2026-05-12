package com.group1.proyect.freshbasket.service;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO login(AuthRequestDTO authRequestDTO);
}
