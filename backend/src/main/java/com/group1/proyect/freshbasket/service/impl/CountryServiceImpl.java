package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.CountryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.CountryResponseDTO;
import com.group1.proyect.freshbasket.entity.Country;
import com.group1.proyect.freshbasket.entity.Exit;
import com.group1.proyect.freshbasket.repository.CountryRepository;
import com.group1.proyect.freshbasket.service.CountryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CountryServiceImpl implements CountryService {

    private final CountryRepository countryRepository;

    public CountryServiceImpl(CountryRepository countryRepository ) {
        this.countryRepository = countryRepository;
    }

    // DTO → Entity
    private Country convertToEntity(CountryRequestDTO dto) {
        Country country = new Country();
        country.setName(dto.getName());
        country.setDescription(dto.getDescription());

        return country;

    }

    // Entity → DTO
    private CountryResponseDTO convertToDTO(Country country) {
        CountryResponseDTO dto = new CountryResponseDTO();

        dto.setId(country.getId());
        dto.setName(country.getName());
        dto.setDescription(country.getDescription());

        return dto;
    }

    @Override
    public List<CountryResponseDTO> getAllCountries() {
        return countryRepository.findByActiveTrue()
                .stream()
                .filter(Country::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CountryResponseDTO getCountryById(Long id) {
        return countryRepository.findById(id)
                .filter(Country::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Pais no encontrado con ese ID: " + id));
    }

    @Override
    public CountryResponseDTO createCountry(CountryRequestDTO requestDTO) {
        Country country = convertToEntity(requestDTO);
        Country savedCountry = countryRepository.save(country);
        return convertToDTO(savedCountry);
    }

    @Override
    public CountryResponseDTO updateCountry(Long id, CountryRequestDTO requestDTO) {
        return countryRepository.findById(id)
                .map(existingCountry -> {

                    existingCountry.setName(requestDTO.getName());
                    existingCountry.setDescription(requestDTO.getDescription());

                    return countryRepository.save(existingCountry);
                })
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("País no encontrado con ese ID: " + id));
    }

    @Override
    @Transactional // Importante: org.springframework.transaction.annotation.Transactional
    public void deleteCountry(Long id) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("País no encontrado con ese ID: " + id));

        country.setActive(false);
    }

}
