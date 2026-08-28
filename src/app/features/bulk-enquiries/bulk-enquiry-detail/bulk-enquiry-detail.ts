import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BulkEnquiryService } from '../../../core/services/bulk-enquiry';
import { BulkEnquiry } from '../../../core/models/bulk-enquiry.model';

@Component({
  selector: 'app-bulk-enquiry-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bulk-enquiry-detail.html',
  styleUrl: './bulk-enquiry-detail.scss',
})
export class BulkEnquiryDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bulkEnquiryService = inject(BulkEnquiryService);

  // =========================================================
  // DATA
  // =========================================================

  enquiry: BulkEnquiry | null = null;

  enquiryId: number | null = null;

  // =========================================================
  // UPDATE FORM
  // =========================================================

  customerName = '';

  mobile = '';

  email = '';

  productId: number | null = null;

  quantity = 1;

  message = '';

  status = 'Pending';

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  statusOptions = ['Pending', 'Contacted', 'Quoted', 'Converted', 'Rejected'];

  // =========================================================
  // STATE
  // =========================================================

  isLoading = false;

  isSaving = false;

  isDeleting = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (id > 0) {
        this.enquiryId = id;

        this.loadEnquiry(id);
      } else {
        this.errorMessage = 'Invalid bulk enquiry ID.';
      }
    });
  }

  // =========================================================
  // LOAD
  // GET /api/BulkEnquiry/{id}
  // =========================================================

  loadEnquiry(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.bulkEnquiryService.getById(id).subscribe({
      next: (response) => {
        this.enquiry = response;

        this.setFormValues(response);

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Bulk Enquiry Detail API Error:', error);

        this.enquiry = null;

        this.errorMessage = error?.error?.message || 'Unable to load bulk enquiry.';

        this.isLoading = false;
      },
    });
  }

  // =========================================================
  // SET FORM VALUES
  // =========================================================

  private setFormValues(enquiry: BulkEnquiry): void {
    this.customerName = enquiry.customerName || '';

    this.mobile = enquiry.mobile || '';

    this.email = enquiry.email || '';

    this.productId = enquiry.productId ?? null;

    this.quantity = enquiry.quantity || 1;

    this.message = enquiry.message || '';

    this.status = enquiry.status || 'Pending';
  }

  // =========================================================
  // UPDATE
  // PUT /api/BulkEnquiry/{id}
  // =========================================================

  updateEnquiry(): void {
    if (!this.enquiryId) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    // =======================================================
    // VALIDATION
    // =======================================================

    if (!this.customerName.trim()) {
      this.errorMessage = 'Customer name is required.';

      return;
    }

    if (!this.mobile.trim()) {
      this.errorMessage = 'Mobile number is required.';

      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required.';

      return;
    }

    if (this.quantity <= 0) {
      this.errorMessage = 'Quantity must be greater than 0.';

      return;
    }

    if (!this.message.trim()) {
      this.errorMessage = 'Message is required.';

      return;
    }

    this.isSaving = true;

    const data = {
      customerName: this.customerName.trim(),

      mobile: this.mobile.trim(),

      email: this.email.trim(),

      productId: this.productId,

      quantity: this.quantity,

      message: this.message.trim(),

      status: this.status,
    };

    this.bulkEnquiryService.update(this.enquiryId, data).subscribe({
      next: (response) => {
        this.enquiry = response;

        this.setFormValues(response);

        this.successMessage = 'Bulk enquiry updated successfully.';

        this.isSaving = false;
      },

      error: (error) => {
        console.error('Bulk Enquiry Update API Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to update bulk enquiry.';

        this.isSaving = false;
      },
    });
  }

  // =========================================================
  // DELETE
  // DELETE /api/BulkEnquiry/{id}
  // =========================================================

  deleteEnquiry(): void {
    if (!this.enquiryId) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete enquiry #${this.enquiryId}?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.errorMessage = '';

    this.bulkEnquiryService.delete(this.enquiryId).subscribe({
      next: () => {
        this.router.navigate(['/admin/bulk-enquiries']);
      },

      error: (error) => {
        console.error('Bulk Enquiry Delete API Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to delete bulk enquiry.';

        this.isDeleting = false;
      },
    });
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    if (!this.enquiryId) {
      return;
    }

    this.loadEnquiry(this.enquiryId);
  }

  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {
    this.router.navigate(['/admin/bulk-enquiries']);
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
  // DATE TIME FORMAT
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
}
