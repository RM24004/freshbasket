package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.UserRequestDTO;
import com.group1.proyect.freshbasket.dto.response.UserResponseDTO;
import com.group1.proyect.freshbasket.entity.Country;
import com.group1.proyect.freshbasket.entity.User;
import com.group1.proyect.freshbasket.repository.CountryRepository;
import com.group1.proyect.freshbasket.repository.UserRepository;
import com.group1.proyect.freshbasket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final CountryRepository countryRepository;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           CountryRepository countryRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.countryRepository = countryRepository;
    }

    // DTO → Entity
    private User convertToEntity(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());

        String countryName = dto.getCountryName().trim();

        Country country = countryRepository.findByNameIgnoreCase(countryName)
                .orElseGet(() -> {

                    Country newCountry = new Country();
                    newCountry.setName(countryName);

                    String desc = countryName.length() >= 2 ? countryName.substring(0, 2).toUpperCase() : countryName.toUpperCase();
                    newCountry.setDescription(desc);


                    return countryRepository.save(newCountry);
                });

        user.setCountry(country);

        return user;
    }

    // Entity → DTO
    private UserResponseDTO convertToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setPassword(user.getPassword());
        dto.setRole(user.getRole());

        if (user.getCountry() != null) {
            dto.setCountryId(user.getCountry().getId());
            dto.setCountryName(user.getCountry().getName());
        }

        return dto;
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        return userRepository.findById(id)
                .filter(User::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese ID: " + id));
    }

    @Override
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {

        // 1. Validar el input antes de procesar entidades
        String countryName = requestDTO.getCountryName();
        if (countryName == null || countryName.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del país es obligatorio.");
        }

        String cleanedCountryName = countryName.trim();

        User user = convertToEntity(requestDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Country country = countryRepository.findByNameIgnoreCase(cleanedCountryName)
                .orElseGet(() -> {
                    Country newCountry = new Country();
                    newCountry.setName(cleanedCountryName);

                    return countryRepository.save(newCountry);
                });

        user.setCountry(country);
        User savedUser = userRepository.save(user);

        return convertToDTO(savedUser);
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {
        User userExisting = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese ID: " + id));

        userExisting.setName(requestDTO.getName());
        userExisting.setLastName(requestDTO.getLastName());
        userExisting.setPhone(requestDTO.getPhone());
        userExisting.setEmail(requestDTO.getEmail());
        userExisting.setRole(requestDTO.getRole());

        if (requestDTO.getPassword() != null
                && !requestDTO.getPassword().trim().isEmpty()
                && !requestDTO.getPassword().equals("DUMMY_PASSWORD_NOT_CHANGED")) {

            userExisting.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        String countryName = requestDTO.getCountryName();
        if (countryName != null && !countryName.trim().isEmpty()) {
            Country country = countryRepository.findByNameIgnoreCase(countryName.trim())
                    .orElseGet(() -> {
                        Country newCountry = new Country();
                        newCountry.setName(countryName.trim());
                        return countryRepository.save(newCountry);
                    });
            userExisting.setCountry(country);
        }

        User savedUser = userRepository.save( userExisting);
        return convertToDTO(savedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        user.setActive(false);
    }

    @Override
    public List<UserResponseDTO> searchUsersByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .filter(User::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + email));
        return convertToDTO(user);
    }

    @Override
    public UserResponseDTO updateUserProfileByEmail(String email, UserRequestDTO requestDTO) {
        User userExisting = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + email));

        userExisting.setName(requestDTO.getName());
        userExisting.setLastName(requestDTO.getLastName());
        userExisting.setPhone(requestDTO.getPhone());

        if (requestDTO.getPassword() != null
                && !requestDTO.getPassword().trim().isEmpty()
                && !requestDTO.getPassword().equals("DUMMY_PASSWORD_NOT_CHANGED")) {
            userExisting.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }
        
        String countryName = requestDTO.getCountryName();
        if (countryName != null && !countryName.trim().isEmpty()) {
            Country country = countryRepository.findByNameIgnoreCase(countryName.trim())
                    .orElseGet(() -> {
                        Country newCountry = new Country();
                        newCountry.setName(countryName.trim());
                        return countryRepository.save(newCountry);
                    });
            userExisting.setCountry(country);
        }

        User savedUser = userRepository.save(userExisting);
        return convertToDTO(savedUser);
    }

 }
