package com.group1.proyect.freshbasket.repository;

import com.group1.proyect.freshbasket.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // esta parte retorna ENTIDAD, no DTO
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByCurrentStockLessThan(Integer currentStock);
}