package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.EntryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.EntryResponseDTO;
import com.group1.proyect.freshbasket.entity.Entry;
import com.group1.proyect.freshbasket.entity.Product;
import com.group1.proyect.freshbasket.entity.Supplier;
import com.group1.proyect.freshbasket.entity.User;
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

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        entry.setQuantity(dto.getQuantity());
        entry.setProduct(product);
        entry.setSupplier(supplier);
        entry.setUser(user);

        return entry;
    }
    // Entity → DTO
    private EntryResponseDTO toResponse(Entry entry) {
        EntryResponseDTO dto = new EntryResponseDTO();

        dto.setId(entry.getId());
        dto.setQuantity(entry.getQuantity());
        dto.setProductId(entry.getProduct().getId());
        dto.setSupplierId(entry.getSupplier().getId());
        dto.setUserId(entry.getUser().getId());
        if (entry.getProduct() != null) {
            dto.setProductName(entry.getProduct().getName());
        }
        if (entry.getSupplier() != null) {
            dto.setSupplierName(entry.getSupplier().getName());
        }
        if (entry.getUser() != null) {
            dto.setUserName(entry.getUser().getUsername());
        }
        return dto;
    }

    @Override
    public List<EntryResponseDTO> getAllEntries() {
        return entryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional (readOnly = true)
    public EntryResponseDTO getEntryById(Long id) {
               return entryRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Entrada no encontrada con ID: " + id));
    }


    @Override
    public EntryResponseDTO updateEntry(Long id, EntryRequestDTO request) {

        Entry entry = entryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry no encontrada"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        entry.setQuantity(request.getQuantity());
        entry.setProduct(product);
        entry.setSupplier(supplier);
        entry.setUser(user);

        Entry updated = entryRepository.save(entry);

        return toResponse(updated);
    }


    @Override
    public void deleteEntry(Long id) {
        entryRepository.deleteById(id);
    }

}