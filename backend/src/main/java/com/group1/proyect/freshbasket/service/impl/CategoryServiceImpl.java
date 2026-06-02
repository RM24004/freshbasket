package com.group1.proyect.freshbasket.service.impl;

import com.group1.proyect.freshbasket.dto.request.CategoryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.CategoryResponseDTO;
import com.group1.proyect.freshbasket.entity.Category;
import com.group1.proyect.freshbasket.repository.CategoryRepository;
import com.group1.proyect.freshbasket.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository ) {
        this.categoryRepository = categoryRepository;
    }

    // DTO → Entity
    private Category convertToEntity(CategoryRequestDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        return category;

    }

    // Entity → DTO
    private CategoryResponseDTO convertToDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();

        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());

        return dto;
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .filter(Category::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .filter(Category::isActive)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada con ese ID: " + id));
    }

    @Override
    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
        Category category = convertToEntity(requestDTO);
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Override
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO requestDTO) {
        return categoryRepository.findById(id)
                .map(existingCategory -> {

                    existingCategory.setName(requestDTO.getName());
                    existingCategory.setDescription(requestDTO.getDescription());

                    return categoryRepository.save(existingCategory);
                })
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada con ese ID: " + id));
    }

    @Override
    @Transactional // Importante: org.springframework.transaction.annotation.Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada con ese ID: " + id));

        category.setActive(false);
    }

    @Override
    public List<CategoryResponseDTO> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .filter(Category::isActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

}
