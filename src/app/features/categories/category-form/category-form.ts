import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Category,
  CategoryCreate,
  CategoryService,
  CategoryUpdate,
} from '../../../core/services/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly categoryService = inject(CategoryService);

  // =========================================================
  // MODE
  // =========================================================

  isEditMode = false;

  categoryId = 0;

  category: Category | null = null;

  // =========================================================
  // FORM
  // =========================================================

  form: CategoryCreate = {
    categoryName: '',
    description: '',
    imageFile: null,
  };

  // =========================================================
  // EDIT STATUS
  // =========================================================

  isActive = true;

  // Existing image from backend
  currentImageUrl: string | null = null;

  // Selected image preview
  imagePreviewUrl: string | null = null;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && id > 0) {
      this.isEditMode = true;

      this.categoryId = id;

      this.loadCategory();
    }
  }

  // =========================================================
  // LOAD CATEGORY
  // =========================================================

  loadCategory(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.categoryService
      .getById(this.categoryId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Category) => {
          console.log('Category Edit Response:', response);

          this.category = response;

          this.form = {
            categoryName: response.categoryName,

            description: response.description || '',

            imageFile: null,
          };

          this.isActive = response.isActive;

          this.currentImageUrl = response.imageUrl;

          this.imagePreviewUrl = null;
        },

        error: (error: unknown) => {
          console.error('Category Edit API Error:', error);

          this.category = null;

          this.errorMessage = this.getErrorMessage(error, 'Unable to load category details.');
        },
      });
  }

  // =========================================================
  // IMAGE SELECT
  // =========================================================

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // -------------------------------------------------------
    // FILE TYPE VALIDATION
    // -------------------------------------------------------

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG, JPEG, PNG and WEBP images are allowed.';

      input.value = '';

      return;
    }

    // -------------------------------------------------------
    // FILE SIZE VALIDATION
    // Maximum 5 MB
    // -------------------------------------------------------

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      this.errorMessage = 'Image size must be less than 5 MB.';

      input.value = '';

      return;
    }

    // -------------------------------------------------------
    // SAVE FILE
    // -------------------------------------------------------

    this.errorMessage = '';

    this.form.imageFile = file;

    // -------------------------------------------------------
    // PREVIEW
    // -------------------------------------------------------

    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.imagePreviewUrl = URL.createObjectURL(file);
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
  // SUBMIT
  // =========================================================

  submit(): void {
    if (this.isSaving) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    // -------------------------------------------------------
    // TRIM VALUES
    // -------------------------------------------------------

    this.form.categoryName = this.form.categoryName.trim();

    this.form.description = this.form.description.trim();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!this.form.categoryName) {
      this.errorMessage = 'Category name is required.';

      return;
    }

    if (this.form.categoryName.length > 100) {
      this.errorMessage = 'Category name cannot exceed 100 characters.';

      return;
    }

    if (this.form.description.length > 500) {
      this.errorMessage = 'Description cannot exceed 500 characters.';

      return;
    }

    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------

    if (!this.isEditMode) {
      this.createCategory();

      return;
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    this.updateCategory();
  }

  // =========================================================
  // CREATE CATEGORY
  // =========================================================

  private createCategory(): void {
    const data: CategoryCreate = {
      categoryName: this.form.categoryName,

      description: this.form.description,

      imageFile: this.form.imageFile,
    };

    this.isSaving = true;

    this.categoryService
      .create(data)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (response: Category) => {
          console.log('Category Created:', response);

          this.successMessage = 'Category created successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/categories']);
          }, 800);
        },

        error: (error: unknown) => {
          console.error('Category Create Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to create category.');
        },
      });
  }

  // =========================================================
  // UPDATE CATEGORY
  // =========================================================

  private updateCategory(): void {
    const data: CategoryUpdate = {
      categoryName: this.form.categoryName,

      description: this.form.description,

      imageFile: this.form.imageFile,

      isActive: this.isActive,
    };

    this.isSaving = true;

    this.categoryService
      .update(this.categoryId, data)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (response: Category) => {
          console.log('Category Updated:', response);

          this.category = response;

          this.currentImageUrl = response.imageUrl;

          this.imagePreviewUrl = null;

          this.successMessage = 'Category updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/categories', this.categoryId]);
          }, 800);
        },

        error: (error: unknown) => {
          console.error('Category Update Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update category.');
        },
      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    if (this.isEditMode && this.categoryId > 0) {
      this.router.navigate(['/admin/categories', this.categoryId]);

      return;
    }

    this.router.navigate(['/admin/categories']);
  }

  // =========================================================
  // PAGE TITLE
  // =========================================================

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Category' : 'Add Category';
  }

  // =========================================================
  // PAGE DESCRIPTION
  // =========================================================

  get pageDescription(): string {
    return this.isEditMode ? 'Update category information.' : 'Create a new product category.';
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
