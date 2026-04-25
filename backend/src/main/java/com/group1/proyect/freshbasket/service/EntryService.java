package com.group1.proyect.freshbasket.service;

import com.group1.proyect.freshbasket.dto.request.EntryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.EntryResponseDTO;
import java.util.List;
public interface EntryService {

    EntryResponseDTO createEntry(EntryRequestDTO request);

    List<EntryResponseDTO> getAllEntries();

    EntryResponseDTO getEntryById(Long id);

    EntryResponseDTO updateEntry(Long id, EntryRequestDTO request);

    void deleteEntry(Long id);
}