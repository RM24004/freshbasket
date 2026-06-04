package com.group1.proyect.freshbasket.repository;

//import com.group1.proyect.freshbasket.entity.Supplier;
import com.group1.proyect.freshbasket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByNameContainingIgnoreCase(String name);

    @Query("SELECT u FROM User u WHERE LOWER(TRIM(CONCAT(u.name, ' ', COALESCE(u.lastName, '')))) = LOWER(TRIM(:fullName))")
    Optional<User> findByFullNameIgnoreCase(@Param("fullName") String fullName);

    List<User> findByActiveTrue();


}
