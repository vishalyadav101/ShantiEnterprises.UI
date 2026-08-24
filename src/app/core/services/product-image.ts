import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

// =========================================================
// PRODUCT IMAGE RESPONSE
// =========================================================

export interface ProductImage {
  productImageId: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/ProductImage`;

  // =======================================================
  // GET PRODUCT IMAGES
  // GET /api/ProductImage/product/{productId}
  // =======================================================

  getByProductId(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/product/${productId}`);
  }

  // =======================================================
  // UPLOAD PRODUCT IMAGE
  // POST /api/ProductImage/upload/{productId}
  // multipart/form-data
  // =======================================================

  upload(productId: number, image: File, isPrimary: boolean): Observable<ProductImage> {
    const formData = new FormData();

    formData.append('Image', image);

    formData.append('IsPrimary', String(isPrimary));

    return this.http.post<ProductImage>(`${this.apiUrl}/upload/${productId}`, formData);
  }

  // =======================================================
  // DELETE PRODUCT IMAGE
  // DELETE /api/ProductImage/{id}
  // =======================================================

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
