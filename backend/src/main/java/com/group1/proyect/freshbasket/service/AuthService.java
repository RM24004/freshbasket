package com.group1.proyect.freshbasket.service;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.request.UserRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.dto.request.RecoverPasswordRequestDTO;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {

    AuthResponseDTO login(AuthRequestDTO authRequestDTO);

    void recoverPassword(RecoverPasswordRequestDTO request);
    
    void register(UserRequestDTO request);
}
