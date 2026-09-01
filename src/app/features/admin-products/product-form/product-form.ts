import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { concatMap, finalize, from, map } from 'rxjs';
import { ProductService, ProductCreate } from '../../../core/services/product';

import { CategoryService, Category } from '../../../core/services/category';

import { ProductImageService } from '../../../core/services/product-image';

import {
  ProductPriceTierService,
  ProductPriceTier,
} from '../../../core/services/product-price-tier';

// =========================================================
// PRICE TIER FORM MODEL
// =========================================================

interface ProductPriceTierForm {
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
}

// =========================================================
// COMPONENT
// =========================================================

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

  private readonly productPriceTierService = inject(ProductPriceTierService);

  private readonly router = inject(Router);

  // =========================================================
  // FORM
  // =========================================================

  form: ProductCreate = {
    productName: '',
    description: '',
    categoryId: 0,

    mrp: 0,

    retailPrice: 0,

    wholesalePrice: 0,

    shippingCharge: 0,

    stock: 0,

    gstPercentage: 18,

    sku: '',
  };

  // =========================================================
  // PRICE TIERS
  // =========================================================

  priceTiers: ProductPriceTierForm[] = [];

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
  // ADD PRICE TIER
  // =========================================================

  addPriceTier(): void {
    this.priceTiers.push({
      minQuantity: 1,
      maxQuantity: null,
      price: 0,
    });
  }

  // =========================================================
  // REMOVE PRICE TIER
  // =========================================================

  removePriceTier(index: number): void {
    if (index < 0 || index >= this.priceTiers.length) {
      return;
    }

    this.priceTiers.splice(index, 1);
  }

  // =========================================================
  // VALIDATE PRICE TIERS
  // =========================================================

  private validatePriceTiers(): boolean {
    // No tiers = valid.
    // RetailPrice will be used by backend.
    if (this.priceTiers.length === 0) {
      return true;
    }

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    for (let index = 0; index < this.priceTiers.length; index++) {
      const tier = this.priceTiers[index];

      // MINIMUM

      if (!Number.isFinite(Number(tier.minQuantity)) || Number(tier.minQuantity) < 1) {
        this.errorMessage = `Price tier ${index + 1}: ` + 'Minimum quantity must be at least 1.';

        return false;
      }

      // MAXIMUM

      if (
        tier.maxQuantity !== null &&
        tier.maxQuantity !== undefined &&
        Number(tier.maxQuantity) < Number(tier.minQuantity)
      ) {
        this.errorMessage =
          `Price tier ${index + 1}: ` + 'Maximum quantity cannot be less than minimum quantity.';

        return false;
      }

      // PRICE

      if (!Number.isFinite(Number(tier.price)) || Number(tier.price) <= 0) {
        this.errorMessage = `Price tier ${index + 1}: ` + 'Price must be greater than zero.';

        return false;
      }

      // PRICE <= MRP

      if (Number(tier.price) > Number(this.form.mrp)) {
        this.errorMessage = `Price tier ${index + 1}: ` + 'Price cannot be greater than MRP.';

        return false;
      }

      // PRICE <= RETAIL

      if (Number(this.form.retailPrice) > 0 && Number(tier.price) > Number(this.form.retailPrice)) {
        this.errorMessage =
          `Price tier ${index + 1}: ` + 'Price cannot be greater than retail price.';

        return false;
      }
    }

    // -------------------------------------------------------
    // OVERLAP VALIDATION
    // -------------------------------------------------------

    for (let i = 0; i < this.priceTiers.length; i++) {
      const first = this.priceTiers[i];

      for (let j = i + 1; j < this.priceTiers.length; j++) {
        const second = this.priceTiers[j];

        if (
          this.rangesOverlap(
            Number(first.minQuantity),
            this.normalizeMax(first.maxQuantity),
            Number(second.minQuantity),
            this.normalizeMax(second.maxQuantity),
          )
        ) {
          this.errorMessage =
            'Price tiers overlap: ' +
            `${first.minQuantity}-${this.formatMax(first.maxQuantity)} ` +
            'and ' +
            `${second.minQuantity}-${this.formatMax(second.maxQuantity)}.`;

          return false;
        }
      }
    }

    return true;
  }

  // =========================================================
  // NORMALIZE MAX
  // =========================================================

  private normalizeMax(value: number | null | undefined): number | null {
    if (value === null || value === undefined || Number(value) <= 0) {
      return null;
    }

    return Number(value);
  }

  // =========================================================
  // RANGE OVERLAP
  // =========================================================

  private rangesOverlap(
    firstMin: number,
    firstMax: number | null,

    secondMin: number,
    secondMax: number | null,
  ): boolean {
    const firstEnd = firstMax ?? Number.MAX_SAFE_INTEGER;

    const secondEnd = secondMax ?? Number.MAX_SAFE_INTEGER;

    return firstMin <= secondEnd && secondMin <= firstEnd;
  }

  // =========================================================
  // FORMAT MAX
  // =========================================================

  private formatMax(maxQuantity: number | null | undefined): string {
    return maxQuantity === null || maxQuantity === undefined || Number(maxQuantity) <= 0
      ? '+'
      : Number(maxQuantity).toString();
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
    // PRODUCT NAME
    // -------------------------------------------------------

    if (!this.form.productName) {
      this.errorMessage = 'Product name is required.';

      return;
    }

    if (this.form.productName.length > 150) {
      this.errorMessage = 'Product name cannot exceed 150 characters.';

      return;
    }

    // -------------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------------

    if (this.form.description.length > 2000) {
      this.errorMessage = 'Description cannot exceed 2000 characters.';

      return;
    }

    // -------------------------------------------------------
    // CATEGORY
    // -------------------------------------------------------

    if (!this.form.categoryId || this.form.categoryId <= 0) {
      this.errorMessage = 'Please select a category.';

      return;
    }

    // -------------------------------------------------------
    // MRP
    // -------------------------------------------------------

    if (!Number.isFinite(Number(this.form.mrp)) || Number(this.form.mrp) <= 0) {
      this.errorMessage = 'MRP must be greater than 0.';

      return;
    }

    // -------------------------------------------------------
    // RETAIL PRICE
    // -------------------------------------------------------

    if (!Number.isFinite(Number(this.form.retailPrice)) || Number(this.form.retailPrice) <= 0) {
      this.errorMessage = 'Retail price must be greater than 0.';

      return;
    }

    if (Number(this.form.retailPrice) > Number(this.form.mrp)) {
      this.errorMessage = 'Retail price cannot be greater than MRP.';

      return;
    }

    // -------------------------------------------------------
    // WHOLESALE PRICE
    // -------------------------------------------------------

    if (
      !Number.isFinite(Number(this.form.wholesalePrice)) ||
      Number(this.form.wholesalePrice) <= 0
    ) {
      this.errorMessage = 'Wholesale price must be greater than 0.';

      return;
    }

    if (Number(this.form.wholesalePrice) > Number(this.form.mrp)) {
      this.errorMessage = 'Wholesale price cannot be greater than MRP.';

      return;
    }

    if (Number(this.form.wholesalePrice) > Number(this.form.retailPrice)) {
      this.errorMessage = 'Wholesale price cannot be greater than retail price.';

      return;
    }

    // -------------------------------------------------------
    // SHIPPING
    // -------------------------------------------------------

    if (
      !Number.isFinite(Number(this.form.shippingCharge)) ||
      Number(this.form.shippingCharge) < 0
    ) {
      this.errorMessage = 'Shipping charge cannot be negative.';

      return;
    }

    // -------------------------------------------------------
    // STOCK
    // -------------------------------------------------------

    if (!Number.isFinite(Number(this.form.stock)) || Number(this.form.stock) < 0) {
      this.errorMessage = 'Stock cannot be negative.';

      return;
    }

    // -------------------------------------------------------
    // GST
    // -------------------------------------------------------

    if (Number(this.form.gstPercentage) < 0 || Number(this.form.gstPercentage) > 100) {
      this.errorMessage = 'GST percentage must be between 0 and 100.';

      return;
    }

    // -------------------------------------------------------
    // SKU
    // -------------------------------------------------------

    if (!this.form.sku) {
      this.errorMessage = 'SKU is required.';

      return;
    }

    if (this.form.sku.length > 50) {
      this.errorMessage = 'SKU cannot exceed 50 characters.';

      return;
    }

    // -------------------------------------------------------
    // PRICE TIERS
    // -------------------------------------------------------

    if (!this.validatePriceTiers()) {
      return;
    }

    // -------------------------------------------------------
    // CREATE
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

      categoryId: Number(this.form.categoryId),

      mrp: Number(this.form.mrp),

      retailPrice: Number(this.form.retailPrice),

      wholesalePrice: Number(this.form.wholesalePrice),

      shippingCharge: Number(this.form.shippingCharge),

      stock: Number(this.form.stock),

      gstPercentage: Number(this.form.gstPercentage),

      sku: this.form.sku,
    };

    console.log('Create Product Request:', data);

    console.log('Price Tiers:', this.priceTiers);

    this.isSaving = true;

    this.errorMessage = '';

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

          // ---------------------------------------------------
          // PRODUCT CREATED
          // ---------------------------------------------------

          this.savePriceTiers(response.productId);
        },

        error: (error: unknown) => {
          console.error('Product Create Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to create product.');
        },
      });
  }

  // =========================================================
  // SAVE PRICE TIERS
  // =========================================================

  private savePriceTiers(productId: number): void {
    // -------------------------------------------------------
    // NO TIERS
    // -------------------------------------------------------

    if (this.priceTiers.length === 0) {
      this.afterProductCreated(productId);

      return;
    }

    // -------------------------------------------------------
    // CONVERT FORM TIERS TO API REQUESTS
    // -------------------------------------------------------

    const tierRequests = this.priceTiers.map((tier) => {
      const data: ProductPriceTier = {
        productId: productId,

        minQuantity: Number(tier.minQuantity),

        maxQuantity: this.normalizeMax(tier.maxQuantity),

        price: Number(tier.price),
      };

      return data;
    });

    console.log('Price Tier Requests:', tierRequests);

    // -------------------------------------------------------
    // SAVE SEQUENTIALLY
    // -------------------------------------------------------
    //
    // One tier finishes before next tier starts.
    // This makes error handling predictable.
    // -------------------------------------------------------

    from(tierRequests)
      .pipe(
        concatMap((tier) =>
          this.productPriceTierService.create(tier).pipe(
            map((response) => ({
              tier,
              response,
            })),
          ),
        ),
      )
      .subscribe({
        next: (result) => {
          console.log('Price Tier Created:', result.response);
        },

        error: (error: unknown) => {
          console.error('Price Tier Create Error:', error);

          this.errorMessage =
            'Product was created, but one or more price tiers could not be saved.';

          // Product exists, so don't lose it.
          setTimeout(() => {
            this.router.navigate(['/admin/products', productId]);
          }, 1500);
        },

        complete: () => {
          console.log('All Price Tiers Created Successfully.');

          this.afterProductCreated(productId);
        },
      });
  }

  // =========================================================
  // AFTER PRODUCT + TIERS CREATED
  // =========================================================

  private afterProductCreated(productId: number): void {
    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------

    if (this.selectedFile) {
      this.uploadProductImage(productId);

      return;
    }

    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

    this.successMessage =
      this.priceTiers.length > 0
        ? 'Product and price tiers created successfully.'
        : 'Product created successfully.';

    setTimeout(() => {
      this.router.navigate(['/admin/products']);
    }, 900);
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

    this.errorMessage = '';

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

          this.successMessage =
            this.priceTiers.length > 0
              ? 'Product, price tiers and image created successfully.'
              : 'Product created and image uploaded successfully.';

          this.selectedFile = null;

          setTimeout(() => {
            this.router.navigate(['/admin/products']);
          }, 1000);
        },

        error: (error: unknown) => {
          console.error('Product Image Upload Error:', error);

          this.errorMessage =
            'Product and price tiers were created successfully, but image upload failed.';

          setTimeout(() => {
            this.router.navigate(['/admin/products', productId]);
          }, 1500);
        },
      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    if (this.isSaving || this.isUploadingImage) {
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
