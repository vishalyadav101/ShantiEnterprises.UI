import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ContactEnquiryService } from '../../../core/services/contact-enquiry';

import { ContactEnquiry, UpdateContactEnquiry } from '../../../core/models/contact-enquiry.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-enquiry-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact-enquiry-detail.html',
  styleUrl: './contact-enquiry-detail.scss',
})
export class ContactEnquiryDetail implements OnInit {
  private readonly contactEnquiryService = inject(ContactEnquiryService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // DATA
  // =========================================================

  enquiry: ContactEnquiry | null = null;

  contactEnquiryId: number | null = null;

  // =========================================================
  // FORM
  // =========================================================

  selectedStatus = '';

  adminReply = '';

  // =========================================================
  // STATE
  // =========================================================

  isLoading = false;

  isUpdating = false;

  isDeleting = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  statusOptions = ['Pending', 'InProgress', 'Replied', 'Closed'];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (id > 0) {
        this.contactEnquiryId = id;

        this.loadEnquiry(id);
      } else {
        this.errorMessage = 'Invalid contact enquiry ID.';
      }
    });
  }

  // =========================================================
  // LOAD ENQUIRY
  // GET /api/ContactEnquiry/{id}
  // =========================================================

  loadEnquiry(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.contactEnquiryService.getById(id).subscribe({
      next: (response) => {
        this.enquiry = response;

        this.selectedStatus = response.status;

        this.adminReply = response.adminReply ?? '';

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Contact Enquiry Detail API Error:', error);

        this.enquiry = null;

        this.errorMessage = error?.error?.message || 'Unable to load contact enquiry.';

        this.isLoading = false;
      },
    });
  }

  // =========================================================
  // UPDATE
  // PUT /api/ContactEnquiry/{id}
  // =========================================================

  updateEnquiry(): void {
    if (!this.contactEnquiryId) {
      return;
    }

    if (!this.selectedStatus) {
      this.errorMessage = 'Please select a status.';

      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';

    this.successMessage = '';

    const data: UpdateContactEnquiry = {
      status: this.selectedStatus,

      adminReply: this.adminReply.trim() || null,
    };

    this.contactEnquiryService.update(this.contactEnquiryId, data).subscribe({
      next: (response) => {
        this.enquiry = response;

        this.selectedStatus = response.status;

        this.adminReply = response.adminReply ?? '';

        this.isUpdating = false;

        this.successMessage = 'Contact enquiry updated successfully.';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },

      error: (error) => {
        console.error('Contact Enquiry Update API Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to update contact enquiry.';

        this.isUpdating = false;
      },
    });
  }

  // =========================================================
  // DELETE
  // DELETE /api/ContactEnquiry/{id}
  // =========================================================

  deleteEnquiry(): void {
    if (!this.contactEnquiryId) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this contact enquiry?');

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.contactEnquiryService.delete(this.contactEnquiryId).subscribe({
      next: () => {
        this.isDeleting = false;

        this.router.navigate(['/admin/contact-enquiries']);
      },

      error: (error) => {
        console.error('Contact Enquiry Delete API Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to delete contact enquiry.';

        this.isDeleting = false;
      },
    });
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    if (!this.contactEnquiryId) {
      return;
    }

    this.loadEnquiry(this.contactEnquiryId);
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
  // DATE + TIME FORMAT
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

      case 'inprogress':
        return 'in-progress';

      case 'replied':
        return 'replied';

      case 'closed':
        return 'closed';

      default:
        return 'default';
    }
  }
}
