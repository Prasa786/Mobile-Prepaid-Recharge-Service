package com.Voltmobi.project.service;

import com.Voltmobi.project.exception.ResourceNotFoundException;
import com.Voltmobi.project.model.Category;
import com.Voltmobi.project.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findByDeletedFalse();
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByDeletedFalseAndActiveTrue();
    }

    public List<Category> getRechargeCategories() {
        return categoryRepository.findCategoriesWithRechargePlans();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    public Category saveCategory(Category category) {
        if (categoryRepository.findByCategoryName(category.getCategoryName()).isPresent()) {
            throw new IllegalArgumentException("Category with name '" + 
                category.getCategoryName() + "' already exists.");
        }
        return categoryRepository.save(category);
    }

    public Category getCategoryByName(String categoryName) {
        return categoryRepository.findByCategoryName(categoryName)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryName));
    }

    public Category updateCategory(Long id, Category updatedCategory) {
        return categoryRepository.findById(id).map(category -> {
            // Check if name is being changed to an existing name
            if (!category.getCategoryName().equals(updatedCategory.getCategoryName()) &&
                categoryRepository.findByCategoryName(updatedCategory.getCategoryName()).isPresent()) {
                throw new IllegalArgumentException("Category name '" + 
                    updatedCategory.getCategoryName() + "' already exists.");
            }
            
            category.setCategoryName(updatedCategory.getCategoryName());
            category.setActive(updatedCategory.isActive());
            return categoryRepository.save(category);
        }).orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    public void toggleCategoryStatus(Long id, boolean active) {
        Category category = getCategoryById(id);
        category.setActive(active);
        categoryRepository.save(category);
    }

    public void softDeleteCategory(Long id) {
        Category category = getCategoryById(id);
        category.setDeleted(true);
        category.setActive(false); // Deactivate when deleting
        categoryRepository.save(category);
    }
}