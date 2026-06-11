package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.request.RecoverPasswordRequestDTO;
import com.group1.proyect.freshbasket.dto.request.UserRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.entity.User;
import com.group1.proyect.freshbasket.entity.Country;
import com.group1.proyect.freshbasket.repository.UserRepository;
import com.group1.proyect.freshbasket.repository.CountryRepository;
import com.group1.proyect.freshbasket.service.AuthService;
import com.group1.proyect.freshbasket.config.JwtUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CountryRepository countryRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            CountryRepository countryRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.countryRepository = countryRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO authRequestDTO) {
        User user = userRepository.findByEmail(authRequestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrecta"));

        if (!passwordEncoder.matches(authRequestDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email o contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole()
        );

        String cleanRole = String.valueOf(user.getRole());

        return new AuthResponseDTO(token, cleanRole, user.getEmail(), user.getName(), user.getLastName());
    }

    @Override
    public void recoverPassword(RecoverPasswordRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Si el correo existe, se envió el enlace de recuperación."));

        System.out.println("Simulación de envío de correo a: " + user.getEmail());
    }

    @Override
    public void register(UserRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya se encuentra registrado");
        }

        String countryNameClean = request.getCountryName() != null ? request.getCountryName().trim() : "No especificado";


        Country country = countryRepository.findByNameIgnoreCase(countryNameClean)
                .orElseGet(() -> {

                    Country newCountry = new Country();
                    newCountry.setName(countryNameClean);
                    newCountry.setDescription("País registrado automáticamente desde la pagina de registro publico.");

                    return countryRepository.save(newCountry);
                });

        User user = new User();
        user.setName(request.getName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setCountry(country);

        user.setRole("CLIENTE");

        userRepository.save(user);
    }
}