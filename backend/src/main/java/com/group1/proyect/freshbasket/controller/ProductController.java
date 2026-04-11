package com.group1.proyect.freshbasket.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.group1.proyect.freshbasket.dto.request.ProductRequestDTO;
import com.group1.proyect.freshbasket.dto.response.ProductResponseDTO;
import com.group1.proyect.freshbasket.service.ProductService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "API para la gestión de productos del inventario FreshBasket")
public class ProductController {

    private final ProductService productService;

    // Inyección por constructor
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(
        summary = "Obtener todos los productos",
        description = "Retorna una lista completa de todos los productos registrados en el inventario"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Productos obtenidos exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @Operation(
        summary = "Obtener un producto por su ID",
        description = "Busca y retorna un producto específico utilizando su identificador único"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Producto encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(
            @Parameter(description = "ID del producto a buscar", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @Operation(
        summary = "Crear un nuevo producto",
        description = "Registra un nuevo producto en el inventario de FreshBasket"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos del producto inválidos")
    })
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(
            @Parameter(description = "Datos del producto a crear (incluye imageUrl)", required = true)
            @Valid @RequestBody ProductRequestDTO requestDTO) {

        ProductResponseDTO newProduct = productService.createProduct(requestDTO);
        return new ResponseEntity<>(newProduct, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Actualizar un producto existente",
        description = "Reemplaza todos los datos de un producto existente con la nueva información"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @Parameter(description = "ID del producto a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Datos actualizados del producto (incluye imageUrl)", required = true)
            @Valid @RequestBody ProductRequestDTO requestDTO) {

        return ResponseEntity.ok(productService.updateProduct(id, requestDTO));
    }

    @Operation(
        summary = "Eliminar un producto",
        description = "Borra un producto del inventario usando su ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Producto eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "ID del producto a eliminar", example = "1", required = true)
            @PathVariable Long id) {

        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Buscar productos por nombre",
        description = "Retorna productos que coincidan con el nombre especificado (búsqueda parcial)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Productos encontrados"),
        @ApiResponse(responseCode = "404", description = "No se encontraron productos")
    })
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProductsByName(
            @Parameter(description = "Nombre o parte del nombre a buscar", example = "Manzana", required = true)
            @RequestParam String name) {

        return ResponseEntity.ok(productService.searchProductsByName(name));
    }
}