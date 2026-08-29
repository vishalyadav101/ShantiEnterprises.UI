import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ReturnService } from '../../../core/services/return';
import { ReturnRequest } from '../../../core/models/return.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './return-list.html',
  styleUrl: './return-list.scss',
})
export class ReturnList implements OnInit {
  private readonly returnService = inject(ReturnService);

  private readonly router = inject(Router);

  // =========================================================
  // RETURNS
  // =========================================================

  returns: ReturnRequest[] = [];

  filteredReturns: ReturnRequest[] = [];

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // FILTER
  // =========================================================

  selectedStatus = '';

  searchTerm = '';

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  statusOptions = [
    'Pending',
    'Approved',
    'Rejected',
    'ProductReceived',
    'RefundProcessing',
    'Completed',
  ];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadReturns();
  }

  // =========================================================
  // LOAD RETURNS
  // =========================================================

  loadReturns(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.returnService
      .getMyReturns()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.returns = response ?? [];

          this.applyFilters();
        },

        error: (error) => {
          console.error('Returns API Error:', error);

          this.returns = [];

          this.filteredReturns = [];

          this.errorMessage = error?.error?.message || 'Unable to load your return requests.';
        },
      });
  }

  // =========================================================
  // APPLY FILTERS
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    const status = this.selectedStatus.trim().toLowerCase();

    this.filteredReturns = this.returns.filter((item) => {
      const matchesSearch =
        !search ||
        item.orderNumber?.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search) ||
        item.reason?.toLowerCase().includes(search);

      const matchesStatus = !status || item.returnStatus?.toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // STATUS FILTER
  // =========================================================

  onStatusChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // VIEW RETURN
  // =========================================================

  viewReturn(returnRequest: ReturnRequest): void {
    this.router.navigate(['/returns', returnRequest.returnId]);
  }

  // =========================================================
  // RETURN STATUS CLASS
  // =========================================================

  getReturnStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'return-pending';

      case 'approved':
        return 'return-approved';

      case 'rejected':
        return 'return-rejected';

      case 'productreceived':
        return 'return-received';

      case 'refundprocessing':
        return 'return-refund-processing';

      case 'completed':
        return 'return-completed';

      default:
        return 'return-default';
    }
  }

  // =========================================================
  // REFUND STATUS CLASS
  // =========================================================

  getRefundStatusClass(status: string | null | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'refund-pending';

      case 'processing':
        return 'refund-processing';

      case 'completed':
        return 'refund-completed';

      case 'failed':
        return 'refund-failed';

      default:
        return 'refund-default';
    }
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedStatus = '';

    this.applyFilters();
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    this.loadReturns();
  }
}
