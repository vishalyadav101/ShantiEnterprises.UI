import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { Category, CategoryService } from '../../../core/services/category';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList implements OnInit {
  private readonly categoryService = inject(CategoryService);

  // =========================================================
  // DATA
  // =========================================================

  categories: Category[] = [];

  filteredCategories: Category[] = [];

  // =========================================================
  // FILTERS
  // =========================================================

  searchTerm = '';

  selectedStatus = 'All';

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isDeleting = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadCategories();
  }

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  loadCategories(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.categoryService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Category[]) => {
          console.log('Categories Response:', response);

          this.categories = response;

          this.applyFilters();
        },

        error: (error: unknown) => {
          console.error('Categories API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load categories.');
        },
      });
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredCategories = this.categories.filter((category) => {
      const matchesSearch =
        !search ||
        category.categoryName.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        (this.selectedStatus === 'Active' && category.isActive) ||
        (this.selectedStatus === 'Inactive' && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {
    this.applyFilters();
  }

  // =========================================================
  // STATUS FILTER
  // =========================================================

  onStatusChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.applyFilters();
  }

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  deleteCategory(category: Category): void {
    if (this.isDeleting) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${category.categoryName}"?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.categoryService
      .delete(category.categoryId)
      .pipe(
        finalize(() => {
          this.isDeleting = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Category Delete Response:', response);

          this.successMessage = response?.message || 'Category deleted successfully.';

          this.categories = this.categories.filter(
            (item) => item.categoryId !== category.categoryId,
          );

          this.applyFilters();

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Category Delete Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to delete category.');
        },
      });
  }

  // =========================================================
  // COUNTS
  // =========================================================

  get totalCategories(): number {
    return this.categories.length;
  }

  get activeCount(): number {
    return this.categories.filter((category) => category.isActive).length;
  }

  get inactiveCount(): number {
    return this.categories.filter((category) => !category.isActive).length;
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string | null): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  // =========================================================
  // TRACK
  // =========================================================

  trackByCategory(index: number, category: Category): number {
    return category.categoryId;
  }

  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        error?: {
          message?: string;
        };
      };

      return apiError.error?.message || fallback;
    }

    return fallback;
  }
}
