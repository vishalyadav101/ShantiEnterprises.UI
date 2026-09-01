import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, finalize, from, map, of, toArray } from 'rxjs';
import { ProductService, ProductUpdate } from '../../../core/services/product';

import { CategoryService, Category } from '../../../core/services/category';

import {
  ProductPriceTierService,
  ProductPriceTier,
} from '../../../core/services/product-price-tier';

// =========================================================
// PRICE TIER FORM MODEL
// =========================================================

interface ProductEditPriceTier {
  productPriceTierId?: number;
  productId?: number;

  minQuantity: number;
  maxQuantity: number | null;
  price: number;
}

// =========================================================
// PRODUCT EDIT FORM MODEL
// =========================================================

interface ProductEditForm {
  productName: string;

  description: string;

  categoryId: number;

  mrp: number | null;

  retailPrice: number | null;

  wholesalePrice: number | null;

  shippingCharge: number | null;

  stock: number;

  gstPercentage: number;

  sku: string;

  isActive: boolean;
}

// =========================================================
// COMPONENT
// =========================================================

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

  private readonly productPriceTierService = inject(ProductPriceTierService);

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

    retailPrice: null,

    wholesalePrice: null,

    shippingCharge: 0,

    stock: 0,

    gstPercentage: 18,

    sku: '',

    isActive: true,
  };

  // =========================================================
  // PRICE TIERS
  // =========================================================

  priceTiers: ProductEditPriceTier[] = [];

  /**
   * IDs of price tiers which existed when
   * the product was loaded.
   *
   * Used to detect deleted tiers.
   */
  private originalPriceTierIds = new Set<number>();

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

  isSavingPriceTiers = false;

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
  //
  // IMPORTANT:
  // We use getDetails() instead of getById()
  // because details API also returns PriceTiers.
  // =========================================================

  private loadProduct(): void {
    this.isLoadingProduct = true;

    this.errorMessage = '';

    this.productService
      .getDetails(this.productId)
      .pipe(
        finalize(() => {
          this.isLoadingProduct = false;
        }),
      )
      .subscribe({
        next: (product) => {
          console.log('Product Details Loaded:', product);

          // ---------------------------------------------------
          // BASIC PRODUCT DATA
          // ---------------------------------------------------

          this.form = {
            productName: product.productName || '',

            description: product.description || '',

            categoryId: Number(product.categoryId),

            mrp: product.mrp ?? null,

            retailPrice: product.retailPrice ?? null,

            wholesalePrice: product.wholesalePrice ?? null,

            shippingCharge: product.shippingCharge ?? 0,

            stock: Number(product.stock ?? 0),

            gstPercentage: Number(product.gstPercentage ?? 0),

            sku: product.sku || '',

            isActive: product.isActive ?? true,
          };

          // ---------------------------------------------------
          // PRICE TIERS
          // ---------------------------------------------------

          const tiers = Array.isArray(product.priceTiers) ? product.priceTiers : [];

          this.priceTiers = tiers.map((tier: ProductPriceTier) => ({
            productPriceTierId: tier.productPriceTierId,

            productId: tier.productId,

            minQuantity: Number(tier.minQuantity),

            maxQuantity:
              tier.maxQuantity === null || tier.maxQuantity === undefined
                ? null
                : Number(tier.maxQuantity),

            price: Number(tier.price),
          }));

          // ---------------------------------------------------
          // STORE ORIGINAL IDS
          // ---------------------------------------------------

          this.originalPriceTierIds = new Set(
            this.priceTiers
              .filter((tier) => tier.productPriceTierId !== undefined)
              .map((tier) => tier.productPriceTierId!),
          );

          console.log('Loaded Price Tiers:', this.priceTiers);
        },

        error: (error: unknown) => {
          console.error('Product Load Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load product.');
        },
      });
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
  //
  // For an existing tier, removing it from the
  // array will later cause DELETE API call.
  //
  // For a new unsaved tier, it simply disappears.
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
    if (this.priceTiers.length === 0) {
      return true;
    }

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    for (let index = 0; index < this.priceTiers.length; index++) {
      const tier = this.priceTiers[index];

      // MIN QUANTITY

      if (!Number.isFinite(Number(tier.minQuantity)) || Number(tier.minQuantity) < 1) {
        this.errorMessage = `Price tier ${index + 1}: ` + 'Minimum quantity must be at least 1.';

        return false;
      }

      // MAX QUANTITY

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

      if (this.form.mrp !== null && Number(tier.price) > Number(this.form.mrp)) {
        this.errorMessage = `Price tier ${index + 1}: ` + 'Price cannot be greater than MRP.';

        return false;
      }

      // PRICE <= RETAIL PRICE

      if (
        this.form.retailPrice !== null &&
        Number(this.form.retailPrice) > 0 &&
        Number(tier.price) > Number(this.form.retailPrice)
      ) {
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
  // NORMALIZE MAX
  // =========================================================

  private normalizeMax(value: number | null | undefined): number | null {
    if (value === null || value === undefined || Number(value) <= 0) {
      return null;
    }

    return Number(value);
  }

  // =========================================================
  // FORMAT MAX
  // =========================================================

  private formatMax(value: number | null | undefined): string {
    if (value === null || value === undefined || Number(value) <= 0) {
      return '+';
    }

    return Number(value).toString();
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {
    if (this.isSaving || this.isSavingPriceTiers) {
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

    if (
      this.form.mrp === null ||
      !Number.isFinite(Number(this.form.mrp)) ||
      Number(this.form.mrp) <= 0
    ) {
      this.errorMessage = 'MRP must be greater than 0.';

      return;
    }

    // -------------------------------------------------------
    // RETAIL PRICE
    // -------------------------------------------------------

    if (
      this.form.retailPrice === null ||
      !Number.isFinite(Number(this.form.retailPrice)) ||
      Number(this.form.retailPrice) <= 0
    ) {
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
      this.form.wholesalePrice === null ||
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
      this.form.shippingCharge === null ||
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

      categoryId: Number(this.form.categoryId),

      mrp: Number(this.form.mrp),

      retailPrice: Number(this.form.retailPrice),

      wholesalePrice: Number(this.form.wholesalePrice),

      shippingCharge: Number(this.form.shippingCharge),

      stock: Number(this.form.stock),

      gstPercentage: Number(this.form.gstPercentage),

      sku: this.form.sku,

      isActive: this.form.isActive,
    };

    console.log('Update Product Request:', data);

    this.isSaving = true;

    this.errorMessage = '';

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

          // ---------------------------------------------------
          // NOW SYNC PRICE TIERS
          // ---------------------------------------------------

          this.syncPriceTiers(this.productId);
        },

        error: (error: unknown) => {
          console.error('Product Update Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update product.');
        },
      });
  }

  // =========================================================
  // SYNC PRICE TIERS
  // =========================================================
  //
  // Existing:
  // PUT
  //
  // New:
  // POST
  //
  // Removed:
  // DELETE
  // =========================================================

  // private syncPriceTiers(productId: number): void {
  //   if (!this.validatePriceTiers()) {
  //     return;
  //   }

  //   this.isSavingPriceTiers = true;

  //   // -------------------------------------------------------
  //   // CURRENT EXISTING IDS
  //   // -------------------------------------------------------

  //   const currentExistingIds = new Set<number>(
  //     this.priceTiers
  //       .filter((tier) => tier.productPriceTierId !== undefined)
  //       .map((tier) => tier.productPriceTierId!),
  //   );

  //   // -------------------------------------------------------
  //   // FIND DELETED TIERS
  //   // -------------------------------------------------------

  //   const deletedIds = Array.from(this.originalPriceTierIds).filter(
  //     (id) => !currentExistingIds.has(id),
  //   );

  //   // -------------------------------------------------------
  //   // DELETE FIRST
  //   // -------------------------------------------------------

  //   from(deletedIds)
  //     .pipe(
  //       concatMap((tierId) => this.productPriceTierService.delete(tierId)),

  //       // -----------------------------------------------------
  //       // AFTER DELETE → SAVE CURRENT TIERS
  //       // -----------------------------------------------------

  //       concatMap(() => this.saveCurrentPriceTiers(productId)),
  //     )
  //     .subscribe({
  //       next: (result) => {
  //         console.log('Price Tier Sync:', result);
  //       },

  //       error: (error: unknown) => {
  //         console.error('Price Tier Sync Error:', error);

  //         this.isSavingPriceTiers = false;

  //         this.errorMessage = this.getErrorMessage(
  //           error,
  //           'Product updated, but price tier update failed.',
  //         );
  //       },

  //       complete: () => {
  //         this.isSavingPriceTiers = false;

  //         this.successMessage = 'Product and price tiers updated successfully.';

  //         setTimeout(() => {
  //           this.router.navigate(['/admin/products']);
  //         }, 900);
  //       },
  //     });
  // }
  private syncPriceTiers(productId: number): void {
    if (!this.validatePriceTiers()) {
      return;
    }

    this.isSavingPriceTiers = true;

    // -------------------------------------------------------
    // CURRENT EXISTING IDS
    // -------------------------------------------------------

    const currentExistingIds = new Set<number>(
      this.priceTiers
        .filter((tier) => tier.productPriceTierId !== undefined)
        .map((tier) => tier.productPriceTierId!),
    );

    // -------------------------------------------------------
    // FIND DELETED TIERS
    // -------------------------------------------------------

    const deletedIds = Array.from(this.originalPriceTierIds).filter(
      (id) => !currentExistingIds.has(id),
    );

    console.log('Original Tier IDs:', Array.from(this.originalPriceTierIds));
    console.log('Current Tier IDs:', Array.from(currentExistingIds));
    console.log('Deleted Tier IDs:', deletedIds);

    // -------------------------------------------------------
    // DELETE OLD TIERS FIRST
    // -------------------------------------------------------

    from(deletedIds)
      .pipe(
        concatMap((tierId) => this.productPriceTierService.delete(tierId)),

        // IMPORTANT:
        // Even when deletedIds is empty, this emits once
        // and allows saveCurrentPriceTiers() to run.
        toArray(),

        // -----------------------------------------------------
        // AFTER ALL DELETES → SAVE / UPDATE CURRENT TIERS
        // -----------------------------------------------------

        concatMap(() => this.saveCurrentPriceTiers(productId)),
      )
      .subscribe({
        next: (result) => {
          console.log('Price Tier Sync:', result);
        },

        error: (error: unknown) => {
          console.error('Price Tier Sync Error:', error);

          this.isSavingPriceTiers = false;

          this.errorMessage = this.getErrorMessage(
            error,
            'Product updated, but price tier update failed.',
          );
        },

        complete: () => {
          this.isSavingPriceTiers = false;

          this.successMessage = 'Product and price tiers updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/products']);
          }, 900);
        },
      });
  }

  // =========================================================
  // SAVE CURRENT PRICE TIERS
  // =========================================================

  private saveCurrentPriceTiers(productId: number) {
    if (this.priceTiers.length === 0) {
      return of(null);
    }

    return from(this.priceTiers).pipe(
      concatMap((tier) => {
        const data: ProductPriceTier = {
          productId: productId,

          minQuantity: Number(tier.minQuantity),

          maxQuantity: this.normalizeMax(tier.maxQuantity),

          price: Number(tier.price),
        };

        // -------------------------------------------------
        // EXISTING TIER → PUT
        // -------------------------------------------------

        if (tier.productPriceTierId !== undefined) {
          return this.productPriceTierService.update(tier.productPriceTierId, data).pipe(
            map((response) => ({
              action: 'updated',
              response,
            })),
          );
        }

        // -------------------------------------------------
        // NEW TIER → POST
        // -------------------------------------------------

        return this.productPriceTierService.create(data).pipe(
          map((response) => ({
            action: 'created',
            response,
          })),
        );
      }),
    );
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    if (this.isSaving || this.isSavingPriceTiers) {
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

          title?: string;
        };

        message?: string;
      };

      return apiError.error?.message || apiError.error?.title || apiError.message || fallback;
    }

    return fallback;
  }
}
