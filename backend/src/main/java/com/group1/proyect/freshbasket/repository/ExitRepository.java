package com.group1.proyect.freshbasket.repository;

import com.group1.proyect.freshbasket.entity.Exit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExitRepository extends JpaRepository<Exit, Long> {

    List<Exit> findByActiveTrue();
}
