package com.group1.proyect.freshbasket.controller;
import com.group1.proyect.freshbasket.dto.request.AuthRequestDTO;
import com.group1.proyect.freshbasket.dto.request.RecoverPasswordRequestDTO;
import com.group1.proyect.freshbasket.dto.request.UserRequestDTO;
import com.group1.proyect.freshbasket.dto.response.AuthResponseDTO;
import com.group1.proyect.freshbasket.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
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

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody UserRequestDTO request) {
        authService.register(request);
    }
}
