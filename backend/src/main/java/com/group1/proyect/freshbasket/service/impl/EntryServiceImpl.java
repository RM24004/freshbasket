package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.EntryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.EntryResponseDTO;
import com.group1.proyect.freshbasket.entity.*;
import com.group1.proyect.freshbasket.repository.EntryRepository;
import com.group1.proyect.freshbasket.repository.ProductRepository;
import com.group1.proyect.freshbasket.repository.SupplierRepository;
import com.group1.proyect.freshbasket.repository.UserRepository;
import com.group1.proyect.freshbasket.service.EntryService;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EntryServiceImpl implements EntryService {

    private final EntryRepository entryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public EntryServiceImpl(
            EntryRepository entryRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository,
            UserRepository userRepository) {
        this.entryRepository = entryRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
    }

    // DTO → Entity
    private Entry convertToEntity(EntryRequestDTO dto) {
        Entry entry = new Entry();
        entry.setEntryDate(java.time.LocalDateTime.now());
        entry.setUnitCost(dto.getUnitCost());
        entry.setQuantity(dto.getQuantity());

        // Busca ignorando mayúsculas/minúsculas
        String cleanProductName = dto.getProductName() != null ? dto.getProductName().trim() : "";
        Product product = productRepository.findByNameIgnoreCase(cleanProductName)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ese nombre: " + dto.getProductName())); // Corregido typo "encontrada"

        // Busca un proveedor concatenando Name + LastName e ignorando mayúsculas/minúsculas
        String cleanSupplierName = dto.getSupplierName() != null ? dto.getSupplierName().trim() : "";
        Supplier supplier = supplierRepository.findByFullNameIgnoreCase(cleanSupplierName)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con el nombre completo: " + dto.getSupplierName()));

        // Busca un usuario concatenando Name + LastName e ignorando mayúsculas/minúsculas
        String cleanUserName = dto.getUserName() != null ? dto.getUserName().trim() : "";
        User user = userRepository.findByFullNameIgnoreCase(cleanUserName)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el nombre completo: " + dto.getUserName()));

        entry.setProduct(product);
        entry.setSupplier(supplier);
        entry.setUser(user);

        return entry;
    }


    // Entity → DTO
    private EntryResponseDTO convertToDTO(Entry entry) {
        EntryResponseDTO dto = new EntryResponseDTO();

        dto.setId(entry.getId());
        dto.setEntryDate(entry.getEntryDate());
        dto.setUnitCost(entry.getUnitCost());
        dto.setQuantity(entry.getQuantity());


        if (entry.getProduct() != null) {
            dto.setProductId(entry.getProduct().getId());
            dto.setProductName(entry.getProduct().getName());
        } else {
            dto.setProductName("Sin producto asignado");
        }


        if (entry.getSupplier() != null) {
            dto.setSupplierId(entry.getSupplier().getId());

            String sName = entry.getSupplier().getName() != null ? entry.getSupplier().getName() : "";
            String sLastName = entry.getSupplier().getLastName() != null ? entry.getSupplier().getLastName() : "";
            String sFullName = (sName + " " + sLastName).trim();

            if (!sFullName.isEmpty()) {
                dto.setSupplierName(sFullName);
            } else {
                dto.setSupplierName("Proveedor " + entry.getSupplier().getId());
            }
        } else {
            dto.setSupplierName("Sin proveedor asignado");
        }

        if (entry.getUser() != null) {
            dto.setUserId(entry.getUser().getId());

            String uName = entry.getUser().getName() != null ? entry.getUser().getName() : "";
            String uLastName = entry.getUser().getLastName() != null ? entry.getUser().getLastName() : "";
            String uFullName = (uName + " " + uLastName).trim();

            if (!uFullName.isEmpty()) {
                dto.setUserName(uFullName);
            } else {
                dto.setUserName("Usuario " + entry.getUser().getId());
            }
        } else {
            dto.setUserName("Sin usuario asignado");
        }

        return dto;
    }

    @Override
    @Transactional (readOnly = true)
    public EntryResponseDTO getEntryById(Long id) {
        return entryRepository.findById(id)
                .filter(Entry::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Entrada no encontrada con ese ID: " + id));
    }

    @Override
    public List<EntryResponseDTO> getAllEntries() {
        return entryRepository.findByActiveTrue()
                .stream()
                .filter(Entry::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    @Override
    public EntryResponseDTO createEntry(EntryRequestDTO requestDTO) {
        Entry entry = convertToEntity(requestDTO);

        // Actualizar stock del producto
        Product product = entry.getProduct();
        if (product != null) {
            if (!product.isActive()) {
                throw new IllegalStateException("No se pueden registrar entradas para un producto eliminado.");
            }

            int nuevoStock = product.getCurrentStock() + entry.getQuantity();
            product.setCurrentStock(nuevoStock);

            product.setPrice(entry.getUnitCost());

            productRepository.save(product);
        }

        entry.setEntryDate(java.time.LocalDateTime.now());

        Entry savedEntry = entryRepository.save(entry);
        return convertToDTO(savedEntry);
    }


    @Override
    public EntryResponseDTO updateEntry(Long id, EntryRequestDTO requestDTO) {
        Entry entry = entryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrada no encontrada con ese ID"));

        String cleanProductName = requestDTO.getProductName() != null ? requestDTO.getProductName().trim() : "";
        Product product = productRepository.findByNameIgnoreCase(cleanProductName)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ese nombre: " + requestDTO.getProductName()));

        if (!product.isActive()) {
            throw new IllegalStateException("No se puede modificar esta entrada porque el producto asociado está eliminado.");
        }

        String cleanSupplierName = requestDTO.getSupplierName() != null ? requestDTO.getSupplierName().trim() : "";
        Supplier supplier = supplierRepository.findByFullNameIgnoreCase(cleanSupplierName)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ese nombre: " + requestDTO.getSupplierName()));


        String cleanUserName = requestDTO.getUserName() != null ? requestDTO.getUserName().trim() : "";
        User user = userRepository.findByFullNameIgnoreCase(cleanUserName)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese nombre: " + requestDTO.getUserName()));


        // Ajustamos el inventario al actualizar una entrada (si se actualiza el campo de cantidad)
        int cantidadAnterior = entry.getQuantity();
        int cantidadNueva = requestDTO.getQuantity();
        int diferencia = cantidadNueva - cantidadAnterior;

        int nuevoStock = product.getCurrentStock() + diferencia;
        product.setCurrentStock(nuevoStock);

        // Actualizar precio con el nuevo costo unitario
        product.setPrice(requestDTO.getUnitCost());

        productRepository.save(product);

        // Actualizar datos de la entrada
        entry.setQuantity(cantidadNueva);
        entry.setUnitCost(requestDTO.getUnitCost());
        entry.setProduct(product);
        entry.setSupplier(supplier);
        entry.setUser(user);

        Entry updated = entryRepository.save(entry);

        return convertToDTO(updated);
    }



    @Override
    public void deleteEntry(Long id) {
        Entry entry = entryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrada no encontrada con ese ID: " + id));

        //Al eliminar una entrada támbien debe de disminuir el inventario.
        Product product = entry.getProduct();
        if (product != null) {
            if (!product.isActive()) {
                throw new IllegalStateException("No se puede eliminar esta entrada porque pertenece a un producto eliminado.");
            }

            int nuevoStock = product.getCurrentStock() - entry.getQuantity();
            product.setCurrentStock(nuevoStock);
            productRepository.save(product);
        }

        entry.setActive(false);
        entryRepository.save(entry);
    }

}