import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ReturnService } from '../../../core/services/return';

import { ReturnRequest, Refund } from '../../../core/models/return.model';

@Component({
  selector: 'app-admin-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-returns.html',
  styleUrl: './admin-returns.scss',
})
export class AdminReturns implements OnInit {
  private readonly returnService = inject(ReturnService);

  private readonly router = inject(Router);

  // =========================================================
  // DATA
  // =========================================================

  returns: ReturnRequest[] = [];

  filteredReturns: ReturnRequest[] = [];

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // FILTERS
  // =========================================================

  searchTerm = '';

  selectedStatus = '';

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
  // STATUS UPDATE MODAL
  // =========================================================

  isStatusModalOpen = false;

  isUpdatingStatus = false;

  selectedReturn: ReturnRequest | null = null;

  selectedReturnStatus = '';

  adminComment = '';

  statusUpdateError = '';

  // =========================================================
  // REFUND MODAL
  // =========================================================

  isRefundModalOpen = false;

  isCreatingRefund = false;

  selectedRefundReturn: ReturnRequest | null = null;

  refundError = '';

  // =========================================================
  // REFUND STATUS MODAL
  // =========================================================

  isRefundStatusModalOpen = false;

  isUpdatingRefundStatus = false;

  selectedRefund: Refund | null = null;

  selectedRefundStatus = '';

  refundReference = '';

  failureReason = '';

  refundStatusOptions = ['Pending', 'Processing', 'Completed', 'Failed'];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadReturns();
  }

  // =========================================================
  // LOAD ALL RETURNS
  // ADMIN
  // =========================================================

  loadReturns(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.returnService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Admin Returns Response:', response);

          this.returns = response ?? [];

          this.applyFilters();
        },

        error: (error: any) => {
          console.error('Admin Returns API Error:', error);

          this.returns = [];

          this.filteredReturns = [];

          this.errorMessage = error?.error?.message || 'Unable to load return requests.';
        },
      });
  }

  // =========================================================
  // SEARCH + STATUS FILTER
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    const status = this.selectedStatus.trim().toLowerCase();

    this.filteredReturns = this.returns.filter((item) => {
      const matchesSearch =
        !search ||
        item.orderNumber?.toLowerCase().includes(search) ||
        item.customerName?.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search) ||
        item.reason?.toLowerCase().includes(search);

      const matchesStatus = !status || item.returnStatus?.toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedStatus = '';

    this.applyFilters();
  }

  // =========================================================
  // VIEW RETURN
  // =========================================================

  viewReturn(returnRequest: ReturnRequest): void {
    this.router.navigate(['/admin/returns', returnRequest.returnId]);
  }

  // =========================================================
  // OPEN RETURN STATUS MODAL
  // =========================================================

  openStatusModal(returnRequest: ReturnRequest): void {
    this.selectedReturn = returnRequest;

    this.selectedReturnStatus = returnRequest.returnStatus;

    this.adminComment = returnRequest.adminComment || '';

    this.statusUpdateError = '';

    this.successMessage = '';

    this.isStatusModalOpen = true;
  }

  // =========================================================
  // CLOSE RETURN STATUS MODAL
  // =========================================================

  closeStatusModal(): void {
    if (this.isUpdatingStatus) {
      return;
    }

    this.isStatusModalOpen = false;

    this.selectedReturn = null;

    this.selectedReturnStatus = '';

    this.adminComment = '';

    this.statusUpdateError = '';
  }

  // =========================================================
  // UPDATE RETURN STATUS
  // =========================================================

  updateReturnStatus(): void {
    this.statusUpdateError = '';

    this.successMessage = '';

    if (this.isUpdatingStatus) {
      return;
    }

    if (!this.selectedReturn) {
      return;
    }

    if (!this.selectedReturnStatus.trim()) {
      this.statusUpdateError = 'Please select a return status.';

      return;
    }

    // -------------------------------------------------------
    // Basic workflow validation on UI
    // -------------------------------------------------------

    const selectedStatus = this.selectedReturnStatus;

    if (selectedStatus === 'ProductReceived' && this.selectedReturn.returnStatus !== 'Approved') {
      if (
        !['ProductReceived', 'RefundProcessing', 'Completed'].includes(
          this.selectedReturn.returnStatus,
        )
      ) {
        // Backend remains final authority.
        // This only helps prevent accidental UI actions.
      }
    }

    this.isUpdatingStatus = true;

    this.returnService
      .updateStatus(
        this.selectedReturn.returnId,
        selectedStatus,
        this.adminComment.trim() ? this.adminComment.trim() : null,
      )
      .pipe(
        finalize(() => {
          this.isUpdatingStatus = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Return Status Updated:', response);

          this.successMessage = 'Return status updated successfully.';

          this.closeStatusModal();

          this.loadReturns();
        },

        error: (error: any) => {
          console.error('Return Status Update Error:', error);

          this.statusUpdateError = error?.error?.message || 'Unable to update return status.';
        },
      });
  }

  // =========================================================
  // OPEN CREATE REFUND MODAL
  // =========================================================

  openRefundModal(returnRequest: ReturnRequest): void {
    this.selectedRefundReturn = returnRequest;

    this.refundError = '';

    this.successMessage = '';

    this.isRefundModalOpen = true;
  }

  // =========================================================
  // CLOSE REFUND MODAL
  // =========================================================

  closeRefundModal(): void {
    if (this.isCreatingRefund) {
      return;
    }

    this.isRefundModalOpen = false;

    this.selectedRefundReturn = null;

    this.refundError = '';
  }

  // =========================================================
  // CAN CREATE REFUND
  // =========================================================

  canCreateRefund(returnRequest: ReturnRequest): boolean {
    return returnRequest.returnStatus?.toLowerCase() === 'productreceived' && !returnRequest.refund;
  }

  // =========================================================
  // CREATE REFUND
  // =========================================================

  createRefund(): void {
    this.refundError = '';

    this.successMessage = '';

    if (this.isCreatingRefund) {
      return;
    }

    if (!this.selectedRefundReturn) {
      return;
    }

    this.isCreatingRefund = true;

    this.returnService
      .createRefund(this.selectedRefundReturn.returnId)
      .pipe(
        finalize(() => {
          this.isCreatingRefund = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Refund Created:', response);

          this.successMessage = 'Refund created successfully.';

          this.closeRefundModal();

          this.loadReturns();
        },

        error: (error: any) => {
          console.error('Create Refund Error:', error);

          this.refundError = error?.error?.message || 'Unable to create refund.';
        },
      });
  }

  // =========================================================
  // OPEN REFUND STATUS MODAL
  // =========================================================

  openRefundStatusModal(refund: Refund): void {
    this.selectedRefund = refund;

    this.selectedRefundStatus = refund.refundStatus;

    this.refundReference = refund.refundReference || '';

    this.failureReason = refund.failureReason || '';

    this.refundError = '';

    this.successMessage = '';

    this.isRefundStatusModalOpen = true;
  }

  // =========================================================
  // CLOSE REFUND STATUS MODAL
  // =========================================================

  closeRefundStatusModal(): void {
    if (this.isUpdatingRefundStatus) {
      return;
    }

    this.isRefundStatusModalOpen = false;

    this.selectedRefund = null;

    this.selectedRefundStatus = '';

    this.refundReference = '';

    this.failureReason = '';

    this.refundError = '';
  }

  // =========================================================
  // UPDATE REFUND STATUS
  // =========================================================

  updateRefundStatus(): void {
    this.refundError = '';

    this.successMessage = '';

    if (this.isUpdatingRefundStatus) {
      return;
    }

    if (!this.selectedRefund) {
      return;
    }

    if (!this.selectedRefundStatus.trim()) {
      this.refundError = 'Please select a refund status.';

      return;
    }

    // -------------------------------------------------------
    // Failure reason required for Failed
    // -------------------------------------------------------

    if (this.selectedRefundStatus.toLowerCase() === 'failed' && !this.failureReason.trim()) {
      this.refundError = 'Failure reason is required when refund fails.';

      return;
    }

    this.isUpdatingRefundStatus = true;

    this.returnService
      .updateRefundStatus(this.selectedRefund.refundId, {
        refundStatus: this.selectedRefundStatus,

        refundReference: this.refundReference.trim() ? this.refundReference.trim() : null,

        failureReason: this.failureReason.trim() ? this.failureReason.trim() : null,
      })
      .pipe(
        finalize(() => {
          this.isUpdatingRefundStatus = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Refund Status Updated:', response);

          this.successMessage = 'Refund status updated successfully.';

          this.closeRefundStatusModal();

          this.loadReturns();
        },

        error: (error: any) => {
          console.error('Refund Status Update Error:', error);

          this.refundError = error?.error?.message || 'Unable to update refund status.';
        },
      });
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
  // FORMAT DATE TIME
  // =========================================================

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
  // COUNT BY STATUS
  // =========================================================

  getStatusCount(status: string): number {
    return this.returns.filter((item) => item.returnStatus?.toLowerCase() === status.toLowerCase())
      .length;
  }

  // =========================================================
  // TOTAL REFUND AMOUNT
  // =========================================================

  getTotalRefundAmount(): number {
    return this.returns.reduce((total, item) => total + (item.refundAmount || 0), 0);
  }

  // =========================================================
  // COMPLETED REFUNDS
  // =========================================================

  getCompletedRefundCount(): number {
    return this.returns.filter((item) => item.refund?.refundStatus?.toLowerCase() === 'completed')
      .length;
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    this.loadReturns();
  }
}
