package com.group1.proyect.freshbasket.repository;
import com.group1.proyect.freshbasket.entity.Entry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {

}
