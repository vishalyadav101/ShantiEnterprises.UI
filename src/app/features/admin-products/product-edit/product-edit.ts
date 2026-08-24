import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService, ProductUpdate } from '../../../core/services/product';

import { CategoryService, Category } from '../../../core/services/category';

interface ProductEditForm {
  productName: string;
  description: string;
  categoryId: number;
  mrp: number | null;
  wholesalePrice: number | null;
  stock: number;
  gstPercentage: number;
  sku: string;
  isActive: boolean;
}

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.scss',
})
export class ProductEdit implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly productService = inject(ProductService);

  private readonly categoryService = inject(CategoryService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // PRODUCT ID
  // =========================================================

  productId = 0;

  // =========================================================
  // FORM
  // =========================================================

  form: ProductEditForm = {
    productName: '',
    description: '',
    categoryId: 0,
    mrp: null,
    wholesalePrice: null,
    stock: 0,
    gstPercentage: 18,
    sku: '',
    isActive: true,
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  categories: Category[] = [];

  isLoadingCategories = false;

  // =========================================================
  // STATES
  // =========================================================

  isLoadingProduct = false;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid product ID.';
      return;
    }

    this.productId = id;

    this.loadCategories();

    this.loadProduct();
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
  // LOAD PRODUCT
  // =========================================================

  private loadProduct(): void {
    this.isLoadingProduct = true;

    this.errorMessage = '';

    this.productService
      .getById(this.productId)
      .pipe(
        finalize(() => {
          this.isLoadingProduct = false;
        }),
      )
      .subscribe({
        next: (product) => {
          console.log('Product Loaded:', product);

          this.form = {
            productName: product.productName || '',

            description: product.description || '',

            categoryId: product.categoryId,

            mrp: product.mrp,

            wholesalePrice: product.wholesalePrice,

            stock: product.stock,

            gstPercentage: product.gstPercentage,

            sku: product.sku || '',

            isActive: product.isActive,
          };
        },

        error: (error: unknown) => {
          console.error('Product Load Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load product.');
        },
      });
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

    if (this.form.mrp === null || this.form.mrp <= 0) {
      this.errorMessage = 'MRP must be greater than 0.';

      return;
    }

    if (this.form.wholesalePrice === null || this.form.wholesalePrice <= 0) {
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
    // UPDATE PRODUCT
    // -------------------------------------------------------

    this.updateProduct();
  }

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  private updateProduct(): void {
    const data: ProductUpdate = {
      productName: this.form.productName,

      description: this.form.description,

      categoryId: this.form.categoryId,

      mrp: this.form.mrp!,

      wholesalePrice: this.form.wholesalePrice!,

      stock: this.form.stock,

      gstPercentage: this.form.gstPercentage,

      sku: this.form.sku,

      isActive: this.form.isActive,
    };

    console.log('Update Product Request:', data);

    this.isSaving = true;

    this.productService
      .update(this.productId, data)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Product Updated:', response);

          this.successMessage = 'Product updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/products']);
          }, 800);
        },

        error: (error: unknown) => {
          console.error('Product Update Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update product.');
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
    return 'Edit Product';
  }

  // =========================================================
  // PAGE DESCRIPTION
  // =========================================================

  get pageDescription(): string {
    return 'Update product information.';
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
