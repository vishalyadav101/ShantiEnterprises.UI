import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

// =========================================================
// PRICE TIER MODEL
// =========================================================

export interface ProductPriceTier {
  productPriceTierId?: number;
  productId: number;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class ProductPriceTierService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/ProductPriceTier`;

  // =======================================================
  // GET TIERS BY PRODUCT
  // GET /api/ProductPriceTier/product/{productId}
  // =======================================================

  getByProductId(productId: number): Observable<ProductPriceTier[]> {
    return this.http.get<ProductPriceTier[]>(`${this.apiUrl}/product/${productId}`);
  }

  // =======================================================
  // CREATE PRICE TIER
  // POST /api/ProductPriceTier
  // ADMIN
  // =======================================================

  create(data: ProductPriceTier): Observable<ProductPriceTier> {
    return this.http.post<ProductPriceTier>(this.apiUrl, data);
  }

  // =======================================================
  // UPDATE PRICE TIER
  // PUT /api/ProductPriceTier/{id}
  // ADMIN
  // =======================================================

  update(id: number, data: ProductPriceTier): Observable<ProductPriceTier> {
    return this.http.put<ProductPriceTier>(`${this.apiUrl}/${id}`, data);
  }

  // =======================================================
  // DELETE PRICE TIER
  // DELETE /api/ProductPriceTier/{id}
  // ADMIN
  // =======================================================

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{
      message: string;
    }>(`${this.apiUrl}/${id}`);
  }
}
