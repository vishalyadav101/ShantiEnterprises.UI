import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Banner, BannerService } from '../../../core/services/banner';

@Component({
  selector: 'app-banner-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-detail.html',
  styleUrl: './banner-detail.scss',
})
export class BannerDetail implements OnInit {
  private readonly bannerService = inject(BannerService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // DATA
  // =========================================================

  banner: Banner | null = null;

  bannerId: number | null = null;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Invalid banner ID.';
      return;
    }

    this.bannerId = Number(id);

    if (Number.isNaN(this.bannerId)) {
      this.errorMessage = 'Invalid banner ID.';
      return;
    }

    this.loadBanner(this.bannerId);
  }

  // =========================================================
  // LOAD BANNER
  // =========================================================

  loadBanner(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.bannerService
      .getById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (banner: Banner) => {
          this.banner = banner;
        },

        error: (error: unknown) => {
          console.error('Banner Details Error:', error);

          this.banner = null;

          this.errorMessage = this.getErrorMessage(error, 'Unable to load banner details.');
        },
      });
  }

  // =========================================================
  // EDIT BANNER
  // =========================================================

  editBanner(): void {
    if (!this.bannerId) {
      return;
    }

    this.router.navigate(['/admin/banners', this.bannerId, 'edit']);
  }

  // =========================================================
  // BACK TO LIST
  // =========================================================

  goBack(): void {
    this.router.navigate(['/admin/banners']);
  }

  // =========================================================
  // IMAGE ERROR
  // =========================================================

  onImageError(): void {
    console.warn('Unable to load banner image.');
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
