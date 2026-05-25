package com.group1.proyect.freshbasket.service.impl;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.entity.User;
import com.group1.proyect.freshbasket.repository.UserRepository;

import com.group1.proyect.freshbasket.service.AuthService;
import com.group1.proyect.freshbasket.config.JwtUtil;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.group1.proyect.freshbasket.dto.request.RecoverPasswordRequestDTO;


@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;


    public AuthServiceImpl(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO authRequestDTO) {
        // Se busca el usuario por email
        User user = userRepository.findByEmail(authRequestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Se valida la contraseña
        if (!passwordEncoder.matches(authRequestDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        // Se genera el token JWT pasándole el rol
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole()
        );

        String cleanRole = String.valueOf(user.getRole());

        return new AuthResponseDTO(token, cleanRole, user.getEmail());
    }

    @Override
    public void recoverPassword(RecoverPasswordRequestDTO request) {
        // Se verifica si el correo existe en la BD
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Si el correo existe, se envió el enlace de recuperación."));

        // Simulación de envío de correo
        System.out.println("Simulación de envío de correo a: " + user.getEmail());
    }
}
