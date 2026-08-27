import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { BannerService } from '../../../core/services/banner';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banner-list.html',
  styleUrl: './banner-list.scss',
})
export class BannerList implements OnInit {
  private readonly bannerService = inject(BannerService);
  private readonly router = inject(Router);

  // =========================================================
  // DATA
  // =========================================================

  banners: Banner[] = [];

  filteredBanners: Banner[] = [];

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // FILTER
  // =========================================================

  searchText = '';

  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadBanners();
  }

  // =========================================================
  // LOAD BANNERS
  // =========================================================

  loadBanners(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bannerService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Banner[]) => {
          console.log('Banner API Response:', response);

          this.banners = response ?? [];

          this.applyFilters();
        },

        error: (error: unknown) => {
          console.error('Banner API Error:', error);

          this.banners = [];
          this.filteredBanners = [];

          this.errorMessage = this.getErrorMessage(error, 'Unable to load banners.');
        },
      });
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredBanners = this.banners.filter((banner) => {
      const matchesSearch =
        !search ||
        banner.title.toLowerCase().includes(search) ||
        banner.subtitle.toLowerCase().includes(search) ||
        (banner.buttonText ?? '').toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && banner.isActive) ||
        (this.statusFilter === 'inactive' && !banner.isActive);

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

  get totalBanners(): number {
    return this.banners.length;
  }

  get activeBanners(): number {
    return this.banners.filter((banner) => banner.isActive).length;
  }

  get inactiveBanners(): number {
    return this.banners.filter((banner) => !banner.isActive).length;
  }

  // =========================================================
  // ADD BANNER
  // =========================================================

  addBanner(): void {
    this.router.navigate(['/admin/banners/new']);
  }

  // =========================================================
  // EDIT BANNER
  // =========================================================

  editBanner(bannerId: number): void {
    this.router.navigate(['/admin/banners', bannerId, 'edit']);
  }

  // =========================================================
  // VIEW BANNER
  // =========================================================

  viewBanner(bannerId: number): void {
    this.router.navigate(['/admin/banners', bannerId]);
  }

  // =========================================================
  // DELETE BANNER
  // =========================================================

  deleteBanner(banner: Banner): void {
    const confirmed = confirm(`Are you sure you want to delete "${banner.title}"?`);

    if (!confirmed) {
      return;
    }

    this.bannerService.delete(banner.bannerId).subscribe({
      next: () => {
        this.banners = this.banners.filter((item) => item.bannerId !== banner.bannerId);

        this.applyFilters();
      },

      error: (error: unknown) => {
        console.error('Delete Banner Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to delete banner.');
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
