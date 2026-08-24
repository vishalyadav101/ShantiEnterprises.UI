import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../../core/services/product';
import { ProductImages } from '../product-images/product-images/product-images';

// =========================================================
// PRODUCT IMAGE
// =========================================================

interface ProductImage {
  productImageId: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
}

// =========================================================
// PRODUCT PRICE TIER
// =========================================================

interface ProductPriceTier {
  productPriceTierId: number;
  productId: number;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
}

// =========================================================
// PRODUCT DETAIL
// =========================================================

interface ProductDetailData {
  productId: number;

  productName: string;

  description: string;

  categoryId: number;

  categoryName: string;

  mrp: number;

  wholesalePrice: number;

  stock: number;

  gstPercentage: number;

  sku: string;

  imageUrl?: string | null;

  isActive: boolean;

  createdDate: string;

  images: ProductImage[];

  priceTiers: ProductPriceTier[];
}

// =========================================================
// COMPONENT
// =========================================================

@Component({
  selector: 'app-product-detail',

  standalone: true,

  imports: [CommonModule, RouterLink, ProductImages],

  templateUrl: './product-detail.html',

  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly productService = inject(ProductService);

  // =========================================================
  // PRODUCT
  // =========================================================

  product: ProductDetailData | null = null;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // IMAGE
  // =========================================================

  selectedImage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid product ID.';

      return;
    }

    this.loadProduct(id);
  }

  // =========================================================
  // LOAD PRODUCT DETAILS
  // =========================================================

  loadProduct(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.productService
      .getDetails(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: ProductDetailData) => {
          console.log('Product Detail Response:', response);

          this.product = response;

          // -------------------------------------------------
          // SELECT PRIMARY IMAGE
          // -------------------------------------------------

          const primaryImage = response.images?.find((image: ProductImage) => image.isPrimary);

          // -------------------------------------------------
          // SELECT FIRST IMAGE
          // -------------------------------------------------

          const firstImage = response.images?.[0];

          // -------------------------------------------------
          // SET SELECTED IMAGE
          // -------------------------------------------------

          this.selectedImage =
            primaryImage?.imageUrl || firstImage?.imageUrl || response.imageUrl || '';
        },

        error: (error: any) => {
          console.error('Product Detail API Error:', error);

          this.product = null;

          this.errorMessage = error?.error?.message || 'Unable to load product details.';
        },
      });
  }

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }

  // =========================================================
  // STOCK STATUS
  // =========================================================

  get stockStatus(): string {
    if (!this.product) {
      return '';
    }

    if (this.product.stock <= 0) {
      return 'Out of Stock';
    }

    if (this.product.stock <= 10) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  // =========================================================
  // STOCK CSS CLASS
  // =========================================================

  get stockClass(): string {
    if (!this.product) {
      return '';
    }

    if (this.product.stock <= 0) {
      return 'out-of-stock';
    }

    if (this.product.stock <= 10) {
      return 'low-stock';
    }

    return 'in-stock';
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }
}
