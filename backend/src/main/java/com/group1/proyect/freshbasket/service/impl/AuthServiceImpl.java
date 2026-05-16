package com.group1.proyect.freshbasket.service.impl;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.entity.User;
import com.group1.proyect.freshbasket.repository.UserRepository;

import com.group1.proyect.freshbasket.service.AuthService;
import com.group1.proyect.freshbasket.config.JwtUtil;

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

        User user = userRepository.findByEmail(authRequestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(authRequestDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getId()
        );

        return new AuthResponseDTO(token);
    }

     @Override
    public void recoverPassword(RecoverPasswordRequestDTO request) {
        // 1. Verificamos si el correo existe en la BD
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Si el correo existe, se envió el enlace de recuperación."));
        
        // NOTA: Aquí iría la lógica real de enviar el correo (JavaMail).
        // Para efectos del proyecto, simulamos que se envió exitosamente
        // sin revelarle al usuario si el correo existe o no (Por seguridad).
        System.out.println("🛠️ Simulación de envío de correo a: " + user.getEmail());
    }
}
