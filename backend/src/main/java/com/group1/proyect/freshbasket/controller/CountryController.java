package com.group1.proyect.freshbasket.controller;

import com.group1.proyect.freshbasket.dto.request.CountryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.CategoryResponseDTO;
import com.group1.proyect.freshbasket.dto.response.CountryResponseDTO;
import com.group1.proyect.freshbasket.service.CountryService;
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
@RequestMapping("/api/countries")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Countries", description = "API para la gestión de Países de FreshBasket")
public class CountryController {

    private final CountryService countryService;

    // Inyección por constructor
    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    @Operation(
            summary = "Obtener todas los países",
            description = "Retorna una lista completa de todos los países registrados"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Países obtenidos exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<CountryResponseDTO>> getAllCountries() {
        return ResponseEntity.ok(countryService.getAllCountries());
    }

    @Operation(
            summary = "Obtener un país por su ID",
            description = "Busca y retorna un país específico utilizando su identificador único"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "País encontrado exitosamente"),
            @ApiResponse(responseCode = "404", description = "País no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CountryResponseDTO> getCountryById(
            @Parameter(description = "ID del país a buscar", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(countryService.getCountryById(id));
    }

    @Operation(
            summary = "Crear un nuevo País",
            description = "Registra un nuevo País en FreshBasket"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "País creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos del país inválidos")
    })
    @PostMapping
    public ResponseEntity<CountryResponseDTO> createCountry(
            @Parameter(description = "Datos del país a crear", required = true)
            @Valid @RequestBody CountryRequestDTO requestDTO) {

        CountryResponseDTO newCountry = countryService.createCountry(requestDTO);
        return new ResponseEntity<>(newCountry, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Actualizar un país existente",
            description = "Reemplaza todos o algunos de los datos de un país existente con la nueva información"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "País actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "País no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<CountryResponseDTO> updateCountry(
            @Parameter(description = "ID del país a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Datos actualizados del país", required = true)
            @RequestBody CountryRequestDTO requestDTO) {

        return ResponseEntity.ok(countryService.updateCountry(id, requestDTO));
    }

    @Operation(
            summary = "Eliminar una país",
            description = "Borra un país usando su ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "País eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "País  no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCountry(
            @Parameter(description = "ID del país a eliminar", example = "1", required = true)
            @PathVariable Long id) {

        countryService.deleteCountry(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<CountryResponseDTO>> searchCategoriesByName(
            @Parameter(description = "Nombre o parte del nombre del país a buscar", example = "El Salvador", required = true)
            @RequestParam String name) {

        return ResponseEntity.ok(countryService.searchCountriesByName(name));
    }

}
