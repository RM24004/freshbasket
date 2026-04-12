package com.group1.proyect.freshbasket.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;

import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "API de Inventario FreshBasket",
        version = "2.0.0",
        description = """
            API REST para la gestión del inventario de la tienda FreshBasket.
            
            ## Características principales:
            * CRUD completo de productos
            * Búsqueda por nombre
            * Manejo de stock
            * Documentación interactiva con Swagger UI
            
            ## Integrantes del equipo - Grupo 1 DAW
            
            1. Victor Alberto Rodriguez Monterrosa - RM24004  
            2. Alexander Alonso Zeceña Martinez - ZM24004  
            3. José Alfredo López Rivera - LR24003  
            4. Irvin Adonay Ramirez Linares - RL22020  
            5. Claudia Melissa Hernandez Ceren - HC24020  
            
            ## Repositorio del proyecto
            https://github.com/RM240804/freshbasket
            """,
        contact = @Contact(
            name = "Grupo 1 - Desarrollo de Aplicaciones Web",
            email = "equipo.freshbasket@mail.com"
        ),
        license = @License(
            name = "Licencia Académica - Grupo 1 DAW",
            url = "https://github.com/RM240804/freshbasket"
        )
    ),
    servers = {
        @Server(
            description = "Servidor Local",
            url = "http://localhost:8080"
        )
    }
)
public class OpenApiConfig {
}