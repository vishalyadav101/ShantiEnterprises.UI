import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Category, CategoryService } from '../../../core/services/category';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.scss',
})
export class CategoryDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly categoryService = inject(CategoryService);

  category: Category | null = null;

  categoryId = 0;

  isLoading = false;

  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid category ID.';
      return;
    }

    this.categoryId = id;

    this.loadCategory();
  }

  // =========================================================
  // LOAD CATEGORY
  // =========================================================

  loadCategory(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.categoryService
      .getById(this.categoryId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Category) => {
          console.log('Category Detail Response:', response);

          this.category = response;
        },

        error: (error: unknown) => {
          console.error('Category Detail API Error:', error);

          this.category = null;

          this.errorMessage = this.getErrorMessage(error, 'Unable to load category details.');
        },
      });
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string | null): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
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
