package com.group1.proyect.freshbasket.repository;

import com.group1.proyect.freshbasket.entity.Supplier;
import com.group1.proyect.freshbasket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByNameContainingIgnoreCase(String name);

}
