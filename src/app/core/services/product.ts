import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

// =========================================================
// PRICE TIER
// =========================================================

export interface ProductPriceTier {
  productPriceTierId?: number;
  productId?: number;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
}

// =========================================================
// PRODUCT CREATE
// Backend: ProductCreateDto
//
// Product image is uploaded separately using
// ProductImageService.
// =========================================================

export interface ProductCreate {
  productName: string;
  description: string;
  categoryId: number;

  mrp: number;

  retailPrice: number;

  wholesalePrice: number;

  shippingCharge: number;

  stock: number;

  gstPercentage: number;

  sku: string;
}

// =========================================================
// PRODUCT UPDATE
// Backend: ProductUpdateDto
//
// Product image is NOT updated here.
// Images are managed separately using
// ProductImageService.
// =========================================================

export interface ProductUpdate {
  productName: string;
  description: string;
  categoryId: number;

  mrp: number;

  retailPrice: number;

  wholesalePrice: number;

  shippingCharge: number;

  stock: number;

  gstPercentage: number;

  sku: string;

  isActive: boolean;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Product`;

  // =======================================================
  // GET ALL PRODUCTS
  // GET /api/Product
  // =======================================================

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // =======================================================
  // GET PRODUCT BY ID
  // GET /api/Product/{id}
  // =======================================================

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // =======================================================
  // GET COMPLETE PRODUCT DETAILS
  // GET /api/Product/{id}/details
  // =======================================================

  getDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  // =======================================================
  // CREATE PRODUCT
  // POST /api/Product
  // ADMIN
  //
  // Product image will be uploaded separately after
  // product creation using ProductImageService.
  // =======================================================

  create(data: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  // =======================================================
  // UPDATE PRODUCT
  // PUT /api/Product/{id}
  // ADMIN
  //
  // Product image is NOT included here.
  // =======================================================

  update(id: number, data: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  // =======================================================
  // DELETE PRODUCT
  // DELETE /api/Product/{id}
  // ADMIN
  // =======================================================

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{
      message: string;
    }>(`${this.apiUrl}/${id}`);
  }
}
