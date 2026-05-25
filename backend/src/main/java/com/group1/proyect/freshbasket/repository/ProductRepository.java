package com.group1.proyect.freshbasket.repository;

import com.group1.proyect.freshbasket.entity.Product;
import com.group1.proyect.freshbasket.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
// JpaRepository brinda las opciones save(), findById(), findAll(), existsById(), etc.

    List<Product> findByNameContainingIgnoreCase(String name);


}