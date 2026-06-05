package com.group1.proyect.freshbasket.repository;

import com.group1.proyect.freshbasket.entity.Category;
import com.group1.proyect.freshbasket.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country,Long> {

    Optional<Country> findByNameIgnoreCase(String name);

    List<Country> findByNameContainingIgnoreCase(String name);

    List<Country> findByActiveTrue();


}
