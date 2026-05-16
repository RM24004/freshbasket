package com.group1.proyect.freshbasket.controller;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.request.RecoverPasswordRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.service.AuthService;
import org.springframework.web.bind.annotation.*;
import com.group1.proyect.freshbasket.dto.request.RecoverPasswordRequestDTO;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

        @PostMapping("/recover-password")
    public void recoverPassword(@RequestBody RecoverPasswordRequestDTO request) {
        authService.recoverPassword(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody AuthRequestDTO request) {
        return authService.login(request);
    }
}
