package com.group1.proyect.freshbasket.service;

import com.group1.proyect.freshbasket.dto.request.ProductRequestDTO;
import com.group1.proyect.freshbasket.dto.response.ProductResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {
    
    List<ProductResponseDTO> getAllProducts();
    
    ProductResponseDTO getProductById(Long id);
    
    ProductResponseDTO createProduct(ProductRequestDTO requestDTO);
    
    ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO);
    
    void deleteProduct(Long id);
    
    List<ProductResponseDTO> searchProductsByName(String name);
}