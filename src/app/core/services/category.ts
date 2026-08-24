import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =========================================================
// CATEGORY RESPONSE
// =========================================================

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdDate: string;
}

// =========================================================
// CATEGORY CREATE
// =========================================================

export interface CategoryCreate {
  categoryName: string;
  description: string;
  imageFile: File | null;
}

// =========================================================
// CATEGORY UPDATE
// =========================================================

export interface CategoryUpdate {
  categoryName: string;
  description: string;
  imageFile: File | null;
  isActive: boolean;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7266/api/Category';

  // =========================================================
  // GET ALL CATEGORIES
  // =========================================================

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // =========================================================
  // GET CATEGORY BY ID
  // =========================================================

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // =========================================================
  // CREATE CATEGORY
  // =========================================================

  create(data: CategoryCreate): Observable<Category> {
    const formData = new FormData();

    formData.append('CategoryName', data.categoryName);

    formData.append('Description', data.description);

    if (data.imageFile) {
      formData.append('ImageFile', data.imageFile);
    }

    return this.http.post<Category>(this.apiUrl, formData);
  }

  // =========================================================
  // UPDATE CATEGORY
  // =========================================================

  update(id: number, data: CategoryUpdate): Observable<Category> {
    const formData = new FormData();

    formData.append('CategoryName', data.categoryName);

    formData.append('Description', data.description);

    formData.append('IsActive', String(data.isActive));

    if (data.imageFile) {
      formData.append('ImageFile', data.imageFile);
    }

    return this.http.put<Category>(`${this.apiUrl}/${id}`, formData);
  }

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{
      message: string;
    }>(`${this.apiUrl}/${id}`);
  }
}
  