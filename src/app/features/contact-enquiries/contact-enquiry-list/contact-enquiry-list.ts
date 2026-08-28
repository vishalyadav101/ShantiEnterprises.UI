import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContactEnquiryService } from '../../../core/services/contact-enquiry';

import { ContactEnquiry } from '../../../core/models/contact-enquiry.model';

@Component({
  selector: 'app-contact-enquiry-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-enquiry-list.html',
  styleUrl: './contact-enquiry-list.scss',
})
export class ContactEnquiryList implements OnInit {
  private readonly contactEnquiryService = inject(ContactEnquiryService);

  // =========================================================
  // DATA
  // =========================================================

  enquiries: ContactEnquiry[] = [];

  // =========================================================
  // STATE
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadEnquiries();
  }

  // =========================================================
  // LOAD ALL ENQUIRIES
  // GET /api/ContactEnquiry
  // =========================================================

  loadEnquiries(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.contactEnquiryService.getAll().subscribe({
      next: (response) => {
        this.enquiries = response ?? [];

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Contact Enquiry API Error:', error);

        this.enquiries = [];

        this.errorMessage = error?.error?.message || 'Unable to load contact enquiries.';

        this.isLoading = false;
      },
    });
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    this.loadEnquiries();
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

  // =========================================================
  // MESSAGE PREVIEW
  // =========================================================

  getMessagePreview(message: string): string {
    if (!message) {
      return '-';
    }

    if (message.length <= 55) {
      return message;
    }

    return `${message.substring(0, 55)}...`;
  }

  // =========================================================
  // SUBJECT PREVIEW
  // =========================================================

  getSubjectPreview(subject: string): string {
    if (!subject) {
      return '-';
    }

    if (subject.length <= 35) {
      return subject;
    }

    return `${subject.substring(0, 35)}...`;
  }
}
