package com.group1.proyect.freshbasket.service;


import com.group1.proyect.freshbasket.dto.request.CountryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.CountryResponseDTO;
import com.group1.proyect.freshbasket.dto.response.UserResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CountryService {


    List<CountryResponseDTO> getAllCountries();

    CountryResponseDTO getCountryById(Long id);

    CountryResponseDTO createCountry(CountryRequestDTO requestDTO);

    CountryResponseDTO updateCountry (Long id, CountryRequestDTO requestDTO);

    List<CountryResponseDTO> searchCountriesByName(String name);

    void deleteCountry(Long id);
}
