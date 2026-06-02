package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.ProductRequestDTO;
import com.group1.proyect.freshbasket.dto.response.ProductResponseDTO;
import com.group1.proyect.freshbasket.entity.*;
import com.group1.proyect.freshbasket.repository.*;
import com.group1.proyect.freshbasket.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final EntryRepository entryRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              SupplierRepository supplierRepository,
                              UserRepository userRepository,
                              EntryRepository entryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.entryRepository = entryRepository;
    }

    // DTO to Entity
    private Product convertToEntity(ProductRequestDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setCurrentStock(dto.getCurrentStock());
        product.setDescription(dto.getDescription());
        product.setImageUrl(dto.getImageUrl());

        // Busca ignorando mayúsculas/minúsculas
        String cleanCategoryName = dto.getCategoryName() != null ? dto.getCategoryName().trim() : "";
        Category category = categoryRepository.findByNameIgnoreCase(cleanCategoryName)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ese nombre: " + dto.getCategoryName()));

        // Busca un proveedor concatenando Name + LastName e ignorando mayúsculas/minúsculas
        String cleanSupplierName = dto.getSupplierName() != null ? dto.getSupplierName().trim() : "";
        Supplier supplier = supplierRepository.findByFullNameIgnoreCase(cleanSupplierName)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con el nombre completo: " + dto.getSupplierName()));

        // Busca un usuario concatenando Name + LastName e ignorando mayúsculas/minúsculas
        String cleanUserName = dto.getUserName() != null ? dto.getUserName().trim() : "";
        User user = userRepository.findByFullNameIgnoreCase(cleanUserName)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el nombre completo: " + dto.getUserName()));

        product.setCategory(category);
        product.setSupplier(supplier);
        product.setUser(user);

        return product;
    }

    // Entity to DTO
    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setCurrentStock(product.getCurrentStock());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());

        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        } else {
            dto.setCategoryName("Sin categoría asignada");
        }

        if (product.getSupplier() != null) {
            dto.setSupplierId(product.getSupplier().getId());

            String sName = product.getSupplier().getName() != null ? product.getSupplier().getName() : "";
            String sLastName = product.getSupplier().getLastName() != null ? product.getSupplier().getLastName() : "";
            String sFullName = (sName + " " + sLastName).trim();

            if (!sFullName.isEmpty()) {
                dto.setSupplierName(sFullName);
            } else {
                dto.setSupplierName("Proveedor " + product.getSupplier().getId());
            }
        } else {
            dto.setSupplierName("Sin proveedor asignado");
        }

        if (product.getUser() != null) {
            dto.setUserId(product.getUser().getId());

            String uName = product.getUser().getName() != null ? product.getUser().getName() : "";
            String uLastName = product.getUser().getLastName() != null ? product.getUser().getLastName() : "";
            String uFullName = (uName + " " + uLastName).trim();

            if (!uFullName.isEmpty()) {
                dto.setUserName(uFullName);
            } else {
                dto.setUserName("Usuario " + product.getUser().getId());
            }
        } else {
            dto.setUserName("Sin usuario asignado");
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        return productRepository.findById(id)
                .filter(Product::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

    }

    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO) {

        Product product = convertToEntity(requestDTO);

        // Se inicializa el stock
        int stockInicial = requestDTO.getCurrentStock() != null ? requestDTO.getCurrentStock() : 0;
        product.setCurrentStock(stockInicial);

        // Se guarda el producto en la base de datos
        Product savedProduct = productRepository.save(product);

        // Se crea entrada automática si hay stock inicial y las relaciones son válidas
        if (stockInicial > 0) {
            Entry entry = new Entry();
            entry.setProduct(savedProduct);

            entry.setSupplier(savedProduct.getSupplier());
            entry.setUser(savedProduct.getUser());

            entry.setQuantity(stockInicial);
            entry.setUnitCost(savedProduct.getPrice());
            entry.setEntryDate(LocalDateTime.now());

            entryRepository.save(entry);
        }

        return convertToDTO(savedProduct);
    }

    @Override
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO) {
        return productRepository.findById(id)
                .map(existingProduct -> {
                    existingProduct.setName(requestDTO.getName());
                    existingProduct.setPrice(requestDTO.getPrice());
                    existingProduct.setCurrentStock(requestDTO.getCurrentStock());
                    existingProduct.setDescription(requestDTO.getDescription());
                    existingProduct.setImageUrl(requestDTO.getImageUrl());

                    String cleanCategoryName = requestDTO.getCategoryName() != null ? requestDTO.getCategoryName().trim() : "";
                    Category category = categoryRepository.findByNameIgnoreCase(cleanCategoryName)
                            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ese nombre: " + requestDTO.getCategoryName()));

                    String cleanSupplierName = requestDTO.getSupplierName() != null ? requestDTO.getSupplierName().trim() : "";
                    Supplier supplier = supplierRepository.findByFullNameIgnoreCase(cleanSupplierName)
                            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con Nombre: " + requestDTO.getSupplierName()));


                    String cleanUserName = requestDTO.getUserName() != null ? requestDTO.getUserName().trim() : "";
                    User user = userRepository.findByFullNameIgnoreCase(cleanUserName)
                            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con Nombre: " + requestDTO.getUserName()));

                    existingProduct.setCategory(category);
                    existingProduct.setSupplier(supplier);
                    existingProduct.setUser(user);

                    return productRepository.save(existingProduct);
                })
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ese ID: " + id));
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ese ID: " + id));

        product.setActive(false);

    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .filter(Product::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}