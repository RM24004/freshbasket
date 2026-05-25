package com.group1.proyect.freshbasket.repository;

import com.group1.proyect.freshbasket.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country,Long> {

    Optional<Country> findByNameIgnoreCase(String name);
}
