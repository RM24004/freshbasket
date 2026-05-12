package com.group1.proyect.freshbasket.controller;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.service.AuthService;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody AuthRequestDTO request) {
        return authService.login(request);
    }
}
