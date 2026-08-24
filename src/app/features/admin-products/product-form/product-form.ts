import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService, ProductCreate } from '../../../core/services/product';

import { CategoryService, Category } from '../../../core/services/category';

import { ProductImageService } from '../../../core/services/product-image';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly productService = inject(ProductService);

  private readonly categoryService = inject(CategoryService);

  private readonly productImageService = inject(ProductImageService);

  private readonly router = inject(Router);

  // =========================================================
  // FORM
  // Backend: ProductCreateDto
  // =========================================================

  form: ProductCreate = {
    productName: '',
    description: '',
    categoryId: 0,
    mrp: 0,
    wholesalePrice: 0,
    stock: 0,
    gstPercentage: 18,
    sku: '',
  };

  // =========================================================
  // SELECTED IMAGE
  // =========================================================

  selectedFile: File | null = null;

  isPrimary = true;

  // =========================================================
  // CATEGORIES
  // =========================================================

  categories: Category[] = [];

  isLoadingCategories = false;

  // =========================================================
  // STATES
  // =========================================================

  isSaving = false;

  isUploadingImage = false;

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

  private loadCategories(): void {
    this.isLoadingCategories = true;

    this.errorMessage = '';

    this.categoryService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoadingCategories = false;
        }),
      )
      .subscribe({
        next: (categories) => {
          console.log('Categories Response:', categories);

          this.categories = categories.filter((category) => category.isActive);
        },

        error: (error: unknown) => {
          console.error('Category API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load categories.');
        },
      });
  }

  // =========================================================
  // FILE SELECT
  // =========================================================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    const file = input.files[0];

    // -------------------------------------------------------
    // FILE TYPE
    // -------------------------------------------------------

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG, JPEG, PNG and WEBP images are allowed.';

      input.value = '';

      this.selectedFile = null;

      return;
    }

    // -------------------------------------------------------
    // FILE SIZE
    // -------------------------------------------------------

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage = 'Image size cannot be greater than 5 MB.';

      input.value = '';

      this.selectedFile = null;

      return;
    }

    // -------------------------------------------------------
    // SAVE FILE
    // -------------------------------------------------------

    this.selectedFile = file;

    console.log('Selected Product Image:', file);
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

    this.form.productName = this.form.productName.trim();

    this.form.description = this.form.description.trim();

    this.form.sku = this.form.sku.trim().toUpperCase();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!this.form.productName) {
      this.errorMessage = 'Product name is required.';

      return;
    }

    if (!this.form.categoryId || this.form.categoryId <= 0) {
      this.errorMessage = 'Please select a category.';

      return;
    }

    if (this.form.mrp <= 0) {
      this.errorMessage = 'MRP must be greater than 0.';

      return;
    }

    if (this.form.wholesalePrice <= 0) {
      this.errorMessage = 'Wholesale price must be greater than 0.';

      return;
    }

    if (this.form.wholesalePrice > this.form.mrp) {
      this.errorMessage = 'Wholesale price cannot be greater than MRP.';

      return;
    }

    if (this.form.stock < 0) {
      this.errorMessage = 'Stock cannot be negative.';

      return;
    }

    if (this.form.gstPercentage < 0 || this.form.gstPercentage > 100) {
      this.errorMessage = 'GST percentage must be between 0 and 100.';

      return;
    }

    if (!this.form.sku) {
      this.errorMessage = 'SKU is required.';

      return;
    }

    if (this.form.sku.length > 50) {
      this.errorMessage = 'SKU cannot exceed 50 characters.';

      return;
    }

    if (this.form.productName.length > 150) {
      this.errorMessage = 'Product name cannot exceed 150 characters.';

      return;
    }

    if (this.form.description.length > 2000) {
      this.errorMessage = 'Description cannot exceed 2000 characters.';

      return;
    }

    // -------------------------------------------------------
    // CREATE PRODUCT
    // -------------------------------------------------------

    this.createProduct();
  }

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  private createProduct(): void {
    const data: ProductCreate = {
      productName: this.form.productName,

      description: this.form.description,

      categoryId: this.form.categoryId,

      mrp: this.form.mrp,

      wholesalePrice: this.form.wholesalePrice,

      stock: this.form.stock,

      gstPercentage: this.form.gstPercentage,

      sku: this.form.sku,
    };

    console.log('Create Product Request:', data);

    this.isSaving = true;

    this.productService
      .create(data)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Product Created:', response);

          // -------------------------------------------------
          // PRODUCT CREATED
          // -------------------------------------------------

          if (this.selectedFile) {
            this.uploadProductImage(response.productId);
          } else {
            this.successMessage = 'Product created successfully.';

            setTimeout(() => {
              this.router.navigate(['/admin/products']);
            }, 800);
          }
        },

        error: (error: unknown) => {
          console.error('Product Create Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to create product.');
        },
      });
  }

  // =========================================================
  // UPLOAD PRODUCT IMAGE
  // =========================================================

  private uploadProductImage(productId: number): void {
    if (!this.selectedFile) {
      this.router.navigate(['/admin/products']);

      return;
    }

    this.isUploadingImage = true;

    this.productImageService
      .upload(productId, this.selectedFile, this.isPrimary)
      .pipe(
        finalize(() => {
          this.isUploadingImage = false;
        }),
      )
      .subscribe({
        next: (image) => {
          console.log('Product Image Uploaded:', image);

          this.successMessage = 'Product created and image uploaded successfully.';

          this.selectedFile = null;

          setTimeout(() => {
            this.router.navigate(['/admin/products']);
          }, 1000);
        },

        error: (error: unknown) => {
          console.error('Product Image Upload Error:', error);

          this.errorMessage = 'Product created successfully, but image upload failed.';

          setTimeout(() => {
            this.router.navigate(['/admin/products', productId]);
          }, 1200);
        },
      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    this.router.navigate(['/admin/products']);
  }

  // =========================================================
  // PAGE TITLE
  // =========================================================

  get pageTitle(): string {
    return 'Add Product';
  }

  // =========================================================
  // PAGE DESCRIPTION
  // =========================================================

  get pageDescription(): string {
    return 'Create a new product.';
  }

  // =========================================================
  // SELECTED FILE NAME
  // =========================================================

  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }

  // =========================================================
  // SELECTED FILE SIZE
  // =========================================================

  get selectedFileSize(): string {
    if (!this.selectedFile) {
      return '';
    }

    const size = this.selectedFile.size;

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        error?: {
          message?: string;
          title?: string;
        };
        message?: string;
      };

      return apiError.error?.message || apiError.error?.title || apiError.message || fallback;
    }

    return fallback;
  }
}
