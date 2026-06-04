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
        exit.setExitDate(java.time.LocalDateTime.now());
        exit.setQuantity(dto.getQuantity());

        String cleanProductName = dto.getProductName() != null ? dto.getProductName().trim() : "";
        Product product = productRepository.findByNameIgnoreCase(cleanProductName)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ese nombre: " + dto.getProductName()));

        String cleanUserName = dto.getUserName() != null ? dto.getUserName().trim() : "";
        User user = userRepository.findByFullNameIgnoreCase(cleanUserName)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el nombre completo: " + dto.getUserName()));

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

        if (exit.getProduct() != null) {
            dto.setProductId(exit.getProduct().getId());
            dto.setProductName(exit.getProduct().getName());
        } else {
            dto.setProductName("Sin producto asignado");
        }

        if (exit.getUser() != null) {
            dto.setUserId(exit.getUser().getId());

            String uName = exit.getUser().getName() != null ? exit.getUser().getName() : "";
            String uLastName = exit.getUser().getLastName() != null ? exit.getUser().getLastName() : "";
            String uFullName = (uName + " " + uLastName).trim();

            if (!uFullName.isEmpty()) {
                dto.setUserName(uFullName);
            } else {
                dto.setUserName("Usuario " + exit.getUser().getId());
            }
        } else {
            dto.setUserName("Sin usuario asignado");
        }

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

        Product product = exit.getProduct();
        if (product != null) {
            int nuevoStock = product.getCurrentStock() - exit.getQuantity();
            if (nuevoStock < 0) {
                throw new IllegalStateException("Stock insuficiente para realizar la salida");
            }
            product.setCurrentStock(nuevoStock);
            productRepository.save(product);
        }

        exit.setExitDate(java.time.LocalDateTime.now());

        Exit savedExit = exitRepository.save(exit);
        return convertToDTO(savedExit);
    }

    @Override
    public ExitResponseDTO updateExit(Long id, ExitRequestDTO requestDTO) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

        String cleanProductName = requestDTO.getProductName() != null ? requestDTO.getProductName().trim() : "";
        Product product = productRepository.findByNameIgnoreCase(cleanProductName)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ese nombre: " + requestDTO.getProductName()));

        String cleanUserName = requestDTO.getUserName() != null ? requestDTO.getUserName().trim() : "";
        User user = userRepository.findByFullNameIgnoreCase(cleanUserName)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese nombre: " + requestDTO.getUserName()));

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
            if (!product.isActive()) {
                throw new IllegalStateException("No se puede eliminar esta salida porque pertenece a un producto eliminado.");
            }

            int nuevoStock = product.getCurrentStock() + exit.getQuantity();
            product.setCurrentStock(nuevoStock);
            productRepository.save(product);
        }

        exit.setActive(false);
        exitRepository.save(exit);
    }

}
