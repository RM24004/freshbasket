package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.ProductRequestDTO;
import com.group1.proyect.freshbasket.dto.response.ProductResponseDTO;
import com.group1.proyect.freshbasket.entity.Category;
import com.group1.proyect.freshbasket.entity.Product;
import com.group1.proyect.freshbasket.entity.Supplier;
import com.group1.proyect.freshbasket.repository.CategoryRepository;
import com.group1.proyect.freshbasket.repository.ProductRepository;
import com.group1.proyect.freshbasket.repository.SupplierRepository;
import com.group1.proyect.freshbasket.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
    }

    // DTO → Entity
    private Product convertToEntity(ProductRequestDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setDescription(dto.getDescription());
        product.setImageUrl(dto.getImageUrl()); //

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + dto.getSupplierId()));

        product.setCategory(category);
        product.setSupplier(supplier);

        return product;
    }

    // Entity → DTO
    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl()); 

        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        if (product.getSupplier() != null) {
            dto.setSupplierId(product.getSupplier().getId()); // 
            dto.setSupplierName(product.getSupplier().getName());
        }

        return dto;
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO) {
        Product product = convertToEntity(requestDTO);
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    @Override
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO) {
        return productRepository.findById(id)
                .map(existingProduct -> {

                    existingProduct.setName(requestDTO.getName());
                    existingProduct.setPrice(requestDTO.getPrice());
                    existingProduct.setStock(requestDTO.getStock());
                    existingProduct.setDescription(requestDTO.getDescription());
                    existingProduct.setImageUrl(requestDTO.getImageUrl()); // 

                    Category category = categoryRepository.findById(requestDTO.getCategoryId())
                            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + requestDTO.getCategoryId()));

                    Supplier supplier = supplierRepository.findById(requestDTO.getSupplierId())
                            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + requestDTO.getSupplierId()));

                    existingProduct.setCategory(category);
                    existingProduct.setSupplier(supplier);

                    return productRepository.save(existingProduct);
                })
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductResponseDTO> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}