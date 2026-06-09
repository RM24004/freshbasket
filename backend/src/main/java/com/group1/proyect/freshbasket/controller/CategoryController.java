package com.group1.proyect.freshbasket.controller;

import com.group1.proyect.freshbasket.dto.request.CategoryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.CategoryResponseDTO;
import com.group1.proyect.freshbasket.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "API para la gestión de categorías de FreshBasket")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(
            summary = "Obtener todas las categorías",
            description = "Retorna una lista completa de todas las categorías registradas"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categorías obtenidas exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @Operation(
            summary = "Obtener una Categoria por su ID",
            description = "Busca y retorna una categoria específica utilizando su identificador único"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoria encontrada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(
            @Parameter(description = "ID de la categoria a buscar", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @Operation(
            summary = "Crear una nueva Categoria",
            description = "Registra una nueva Categoria de FreshBasket"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Categoria creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de la categoria inválidos")
    })
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @Parameter(description = "Datos de la categoria a crear", required = true)
            @Valid @RequestBody CategoryRequestDTO requestDTO) {

        CategoryResponseDTO newCategory = categoryService.createCategory(requestDTO);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Actualizar una Categoria existente",
            description = "Reemplaza todos o algunos de los datos de una categoria existente con la nueva información"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoria actualizada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Categoria no encontrada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @Parameter(description = "ID de la categoria a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Datos actualizados de la categoria", required = true)
            @RequestBody CategoryRequestDTO requestDTO) {

        return ResponseEntity.ok(categoryService.updateCategory(id, requestDTO));
    }

    @Operation(
            summary = "Eliminar una Categoria",
            description = "Borra una categoria usando su ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Categoria eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Categoria no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @Parameter(description = "ID de la categoria a eliminar", example = "1", required = true)
            @PathVariable Long id) {

        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Buscar categorías por nombre",
            description = "Retorna categorías que coincidan con el nombre especificado (búsqueda parcial)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categorías encontrados"),
            @ApiResponse(responseCode = "404", description = "No se encontraron categorías con ese nombre")
    })
    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponseDTO>> searchCategoriesByName(
            @Parameter(description = "Nombre o parte del nombre de la categoria a buscar", example = "Frutas", required = true)
            @RequestParam String name) {

        return ResponseEntity.ok(categoryService.searchCategoriesByName(name));
    }
}
