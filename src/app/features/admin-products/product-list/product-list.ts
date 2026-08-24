import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);

  private readonly router = inject(Router);

  // =========================================================
  // DATA
  // =========================================================

  products: Product[] = [];

  filteredProducts: Product[] = [];

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadProducts();
  }

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  loadProducts(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.productService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Admin Product API Response:', response);

          this.products = response;

          this.applyFilters();
        },

        error: (error: unknown) => {
          console.error('Admin Product API Error:', error);

          this.products = [];

          this.filteredProducts = [];

          this.errorMessage = this.getErrorMessage(error, 'Unable to load products.');
        },
      });
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredProducts = this.products.filter((product) => {
      // Search
      const matchesSearch =
        !search ||
        product.productName.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.categoryName.toLowerCase().includes(search);

      // Status
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && product.isActive) ||
        (this.statusFilter === 'inactive' && !product.isActive);

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
    this.searchText = '';

    this.statusFilter = 'all';

    this.applyFilters();
  }

  // =========================================================
  // COUNTS
  // =========================================================

  get totalProducts(): number {
    return this.products.length;
  }

  get activeProducts(): number {
    return this.products.filter((product) => product.isActive).length;
  }

  get inactiveProducts(): number {
    return this.products.filter((product) => !product.isActive).length;
  }

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  addProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }

  // =========================================================
  // VIEW PRODUCT
  // =========================================================

  viewProduct(productId: number): void {
    this.router.navigate(['/admin/products', productId]);
  }

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  editProduct(productId: number): void {
    this.router.navigate(['/admin/products', productId, 'edit']);
  }

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.productName}"?`);

    if (!confirmed) {
      return;
    }

    this.productService.delete(product.productId).subscribe({
      next: () => {
        this.products = this.products.filter((x) => x.productId !== product.productId);

        this.applyFilters();
      },

      error: (error: unknown) => {
        console.error('Delete Product Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to delete product.');
      },
    });
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
