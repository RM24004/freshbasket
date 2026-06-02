package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.ExitRequestDTO;
import com.group1.proyect.freshbasket.dto.response.ExitResponseDTO;
import com.group1.proyect.freshbasket.entity.Exit;
import com.group1.proyect.freshbasket.entity.Product;
import com.group1.proyect.freshbasket.entity.User;
import com.group1.proyect.freshbasket.repository.ExitRepository;
import com.group1.proyect.freshbasket.repository.ProductRepository;
import com.group1.proyect.freshbasket.repository.UserRepository;
import com.group1.proyect.freshbasket.service.ExitService;
import jakarta.persistence.Column;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExitServiceImpl implements ExitService {

    private final ExitRepository exitRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ExitServiceImpl(
            ExitRepository exitRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.exitRepository = exitRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // DTO → Entity
    private Exit convertToEntity(ExitRequestDTO dto) {
        Exit exit = new Exit();

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        exit.setExitDate(dto.getExitDate());
        exit.setQuantity(dto.getQuantity());
        exit.setProduct(product);
        exit.setUser(user);

        return exit;
    }

    // Entity → DTO
    private ExitResponseDTO convertToDTO(Exit exit) {
        ExitResponseDTO dto = new ExitResponseDTO();

        dto.setId(exit.getId());
        dto.setExitDate(exit.getExitDate());
        dto.setQuantity(exit.getQuantity());
        dto.setProductId(exit.getProduct().getId());
        dto.setUserId(exit.getUser().getId());

        return dto;
    }

    @Override
    @Transactional (readOnly = true)
    public ExitResponseDTO getExitById(Long id) {
        return exitRepository.findById(id)
                .filter(Exit::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada con ese ID: " + id));
    }

    @Override
    public List<ExitResponseDTO> getAllExits() {
        return exitRepository.findByActiveTrue()
                .stream()
                .filter(Exit::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExitResponseDTO createExit(ExitRequestDTO requestDTO) {
        Exit exit = convertToEntity(requestDTO);

        // Se actualiza el stock del producto
        Product product = exit.getProduct();
        if (product != null) {
            int nuevoStock = product.getCurrentStock() - exit.getQuantity();
            if (nuevoStock < 0) {
                throw new IllegalStateException("Stock insuficiente para realizar la salida");
            }
            product.setCurrentStock(nuevoStock);
            productRepository.save(product);
        }

        Exit savedExit = exitRepository.save(exit);
        return convertToDTO(savedExit);
    }

    @Override
    public ExitResponseDTO updateExit(Long id, ExitRequestDTO requestDTO) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

        Product product = productRepository.findById(requestDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("ID del Producto no encontrado"));

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("ID del Usuario no encontrado"));

        // Si se actualiza el campo de la cantida se ajusta el stock según diferencia
        int cantidadAnterior = exit.getQuantity();
        int cantidadNueva = requestDTO.getQuantity();
        int diferencia = cantidadNueva - cantidadAnterior;

        int nuevoStock = product.getCurrentStock() - diferencia;
        if (nuevoStock < 0) {
            throw new IllegalStateException("Stock insuficiente para actualizar la salida");
        }
        product.setCurrentStock(nuevoStock);
        productRepository.save(product);

        // Se actualizan los datos de la salida
        exit.setExitDate(requestDTO.getExitDate());
        exit.setQuantity(cantidadNueva);
        exit.setProduct(product);
        exit.setUser(user);

        Exit updated = exitRepository.save(exit);
        return convertToDTO(updated);
    }

    @Override
    public void deleteExit(Long id) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada con ese ID: " + id));

        Product product = exit.getProduct();
        if (product != null) {
            int nuevoStock = product.getCurrentStock() + exit.getQuantity();
            product.setCurrentStock(nuevoStock);
            productRepository.save(product);
        }

        exit.setActive(false);
    }

}
