package com.group1.proyect.freshbasket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String name;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 50)
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "El email es obligatorio")
    @Email
    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @NotBlank(message = "El telefono es obligatorio")
    @Column(nullable = false, length = 20)
    private String phone;

    @NotBlank(message = "El password es obligatorio")
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @NotNull(message = "El ID es obligatorio")
    @Column(name = "country_id", nullable = false)
    private Long countryId;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY) 
    @JsonIgnore
    private List<Entry> entries = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY) 
    @JsonIgnore
    private List<Exit> exits = new ArrayList<>();
}