package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.SupplierRequestDTO;
import com.group1.proyect.freshbasket.dto.response.SupplierResponseDTO;
import com.group1.proyect.freshbasket.entity.Country;
import com.group1.proyect.freshbasket.entity.Supplier;
import com.group1.proyect.freshbasket.entity.User;
import com.group1.proyect.freshbasket.repository.CountryRepository;
import com.group1.proyect.freshbasket.repository.SupplierRepository;
import com.group1.proyect.freshbasket.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final CountryRepository countryRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
                               CountryRepository countryRepository) {
        this.supplierRepository = supplierRepository;
        this.countryRepository = countryRepository;
    }

    // DTO → Entity
    private Supplier convertToEntity(SupplierRequestDTO dto) {
        Supplier supplier = new Supplier();
        supplier.setName(dto.getName());
        supplier.setLastName(dto.getLastName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());

        Country country = countryRepository.findById(dto.getCountryId())
                .orElseThrow(() -> new RuntimeException("País no encontrado con ese ID: " + dto.getCountryId()));

        supplier.setCountry(country);

        return supplier;

    }

    // Entity → DTO
    private SupplierResponseDTO convertToDTO(Supplier supplier) {
        SupplierResponseDTO dto = new SupplierResponseDTO();

        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setLastName(supplier.getLastName());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setCountryId(supplier.getCountry().getId());


        return dto;
    }

    @Override
    public List<SupplierResponseDTO> getAllSuppliers() {
        return supplierRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponseDTO getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .filter(Supplier::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ese ID: " + id));
    }

    @Override
    public SupplierResponseDTO createSupplier(SupplierRequestDTO requestDTO) {
        Supplier supplier = convertToEntity(requestDTO);
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDTO(savedSupplier);
    }

    @Override
    public SupplierResponseDTO updateSupplier(Long id, SupplierRequestDTO requestDTO) {
        return supplierRepository.findById(id)
                .map(existingSupplier -> {

                    existingSupplier.setName(requestDTO.getName());
                    existingSupplier.setLastName(requestDTO.getLastName());
                    existingSupplier.setEmail(requestDTO.getEmail());
                    existingSupplier.setPhone(requestDTO.getPhone());
                    existingSupplier.setAddress(requestDTO.getAddress());

                    Country country = countryRepository.findById(requestDTO.getCountryId())
                            .orElseThrow(() -> new RuntimeException("País no encontrado con ese ID: " + requestDTO.getCountryId()));

                    return supplierRepository.save(existingSupplier);
                })
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ese ID: " + id));
    }

    @Override
    @Transactional // Importante: org.springframework.transaction.annotation.Transactional
    public void deleteSupplier(Long id) {
        // Buscamos el usuario primero
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ese ID: " + id));

        supplier.setActive(false);
    }

    @Override
    public List<SupplierResponseDTO> searchSuppliersByName(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .filter(Supplier::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
