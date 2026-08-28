import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BulkEnquiryService } from '../../../core/services/bulk-enquiry';

import { BulkEnquiry } from '../../../core/models/bulk-enquiry.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-bulk-enquiry-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bulk-enquiry-list.html',
  styleUrl: './bulk-enquiry-list.scss',
})
export class BulkEnquiryList implements OnInit {
  private readonly bulkEnquiryService = inject(BulkEnquiryService);

  // =========================================================
  // DATA
  // =========================================================

  enquiries: BulkEnquiry[] = [];

  filteredEnquiries: BulkEnquiry[] = [];

  // =========================================================
  // STATE
  // =========================================================

  isLoading = false;

  errorMessage = '';

  searchTerm = '';

  selectedStatus = 'All';

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  statusOptions = ['All', 'Pending', 'Contacted', 'Quoted', 'Converted', 'Rejected'];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadEnquiries();
  }

  // =========================================================
  // LOAD ALL
  // GET /api/BulkEnquiry
  // =========================================================

  loadEnquiries(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.bulkEnquiryService.getAll().subscribe({
      next: (response) => {
        this.enquiries = response ?? [];

        this.applyFilters();

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Bulk Enquiry API Error:', error);

        this.enquiries = [];

        this.filteredEnquiries = [];

        this.errorMessage = error?.error?.message || 'Unable to load bulk enquiries.';

        this.isLoading = false;
      },
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
  // APPLY FILTERS
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    const status = this.selectedStatus;

    this.filteredEnquiries = this.enquiries.filter((enquiry) => {
      // =========================
      // SEARCH
      // =========================

      const matchesSearch =
        !search ||
        enquiry.customerName?.toLowerCase().includes(search) ||
        enquiry.email?.toLowerCase().includes(search) ||
        enquiry.mobile?.toLowerCase().includes(search) ||
        enquiry.productName?.toLowerCase().includes(search) ||
        enquiry.message?.toLowerCase().includes(search) ||
        String(enquiry.bulkEnquiryId).includes(search);

      // =========================
      // STATUS
      // =========================

      const matchesStatus = status === 'All' || enquiry.status === status;

      return matchesSearch && matchesStatus;
    });
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.applyFilters();
  }

  // =========================================================
  // DELETE
  // DELETE /api/BulkEnquiry/{id}
  // =========================================================

  deleteEnquiry(enquiry: BulkEnquiry): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete enquiry #${enquiry.bulkEnquiryId}?`,
    );

    if (!confirmed) {
      return;
    }

    this.bulkEnquiryService.delete(enquiry.bulkEnquiryId).subscribe({
      next: () => {
        this.enquiries = this.enquiries.filter(
          (item) => item.bulkEnquiryId !== enquiry.bulkEnquiryId,
        );

        this.applyFilters();
      },

      error: (error) => {
        console.error('Bulk Enquiry Delete API Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to delete bulk enquiry.';
      },
    });
  }

  // =========================================================
  // DATE FORMAT
  // =========================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =========================================================
  // DATE + TIME
  // =========================================================

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending';

      case 'contacted':
        return 'contacted';

      case 'quoted':
        return 'quoted';

      case 'converted':
        return 'converted';

      case 'rejected':
        return 'rejected';

      default:
        return 'default';
    }
  }

  // =========================================================
  // STATUS ICON
  // =========================================================

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bi-clock-fill';

      case 'contacted':
        return 'bi-telephone-fill';

      case 'quoted':
        return 'bi-file-earmark-text-fill';

      case 'converted':
        return 'bi-check-circle-fill';

      case 'rejected':
        return 'bi-x-circle-fill';

      default:
        return 'bi-info-circle-fill';
    }
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    this.loadEnquiries();
  }
}
