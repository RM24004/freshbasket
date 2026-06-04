package com.group1.proyect.freshbasket.service;

import com.group1.proyect.freshbasket.dto.request.EntryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.EntryResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface EntryService {

    List<EntryResponseDTO> getAllEntries();

    EntryResponseDTO getEntryById(Long id);

    EntryResponseDTO createEntry(EntryRequestDTO requestDTO);

    EntryResponseDTO updateEntry(Long id, EntryRequestDTO requestDTO);

    void deleteEntry(Long id);
}