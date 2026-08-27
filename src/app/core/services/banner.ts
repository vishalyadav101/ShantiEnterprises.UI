import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

// =========================================================
// BANNER MODEL
// =========================================================

export interface Banner {
  bannerId: number;
  title: string;
  subtitle: string;
  imageUrl: string;

  buttonText?: string | null;
  buttonUrl?: string | null;

  displayOrder: number;
  isActive: boolean;

  createdDate: string;
}

// =========================================================
// CREATE BANNER
// Backend: BannerCreateDto
// =========================================================

export interface BannerCreate {
  title: string;
  subtitle: string;
  image: File;

  buttonText?: string | null;
  buttonUrl?: string | null;

  displayOrder: number;
  isActive: boolean;
}

// =========================================================
// UPDATE BANNER
// Backend: BannerUpdateDto
//
// Image can also be replaced.
// =========================================================

export interface BannerUpdate {
  title: string;
  subtitle: string;

  image?: File | null;

  buttonText?: string | null;
  buttonUrl?: string | null;

  displayOrder: number;
  isActive: boolean;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Banner`;

  // =======================================================
  // GET ALL BANNERS
  // GET /api/Banner
  // =======================================================

  getAll(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.apiUrl);
  }

  // =======================================================
  // GET BANNER BY ID
  // GET /api/Banner/{id}
  // =======================================================

  getById(id: number): Observable<Banner> {
    return this.http.get<Banner>(`${this.apiUrl}/${id}`);
  }

  // =======================================================
  // CREATE BANNER
  // POST /api/Banner
  //
  // multipart/form-data
  // =======================================================

  create(data: BannerCreate): Observable<Banner> {
    const formData = new FormData();

    formData.append('Title', data.title);

    formData.append('Subtitle', data.subtitle);

    formData.append('Image', data.image, data.image.name);

    if (data.buttonText) {
      formData.append('ButtonText', data.buttonText);
    }

    if (data.buttonUrl) {
      formData.append('ButtonUrl', data.buttonUrl);
    }

    formData.append('DisplayOrder', data.displayOrder.toString());

    formData.append('IsActive', data.isActive.toString());

    return this.http.post<Banner>(this.apiUrl, formData);
  }

  // =======================================================
  // UPDATE BANNER
  // PUT /api/Banner/{id}
  //
  // multipart/form-data
  // =======================================================

  update(id: number, data: BannerUpdate): Observable<Banner> {
    const formData = new FormData();

    formData.append('Title', data.title);

    formData.append('Subtitle', data.subtitle);

    if (data.image) {
      formData.append('Image', data.image, data.image.name);
    }

    if (data.buttonText) {
      formData.append('ButtonText', data.buttonText);
    } else {
      formData.append('ButtonText', '');
    }

    if (data.buttonUrl) {
      formData.append('ButtonUrl', data.buttonUrl);
    } else {
      formData.append('ButtonUrl', '');
    }

    formData.append('DisplayOrder', data.displayOrder.toString());

    formData.append('IsActive', data.isActive.toString());

    return this.http.put<Banner>(`${this.apiUrl}/${id}`, formData);
  }

  // =======================================================
  // DELETE BANNER
  // DELETE /api/Banner/{id}
  // =======================================================

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
