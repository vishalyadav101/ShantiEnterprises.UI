import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ReturnService } from '../../../core/services/return';
import { ReturnRequest } from '../../../core/models/return.model';

@Component({
  selector: 'app-return-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './return-detail.html',
  styleUrl: './return-detail.scss',
})
export class ReturnDetail implements OnInit {
  private readonly returnService = inject(ReturnService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // RETURN
  // =========================================================

  returnRequest: ReturnRequest | null = null;

  returnId: number | null = null;

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
      this.errorMessage = 'Invalid return ID.';
      return;
    }

    const parsedId = Number(id);

    if (Number.isNaN(parsedId) || parsedId <= 0) {
      this.errorMessage = 'Invalid return ID.';
      return;
    }

    this.returnId = parsedId;

    this.loadReturn(parsedId);
  }

  // =========================================================
  // LOAD RETURN
  // =========================================================

  loadReturn(returnId: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.returnService
      .getById(returnId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Return Detail Response:', response);

          this.returnRequest = response;
        },

        error: (error) => {
          console.error('Return Detail API Error:', error);

          this.returnRequest = null;

          this.errorMessage = error?.error?.message || 'Unable to load return details.';
        },
      });
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    if (!this.returnId) {
      return;
    }

    this.loadReturn(this.returnId);
  }

  // =========================================================
  // BACK TO RETURNS
  // =========================================================

  goToReturns(): void {
    this.router.navigate(['/returns']);
  }

  // =========================================================
  // GO TO ORDER
  // =========================================================

  goToOrder(): void {
    if (!this.returnRequest?.orderId) {
      return;
    }

    this.router.navigate(['/orders', this.returnRequest.orderId]);
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
  // RETURN TIMELINE STATE
  // =========================================================

  isReturnStepCompleted(step: string): boolean {
    if (!this.returnRequest) {
      return false;
    }

    const status = this.returnRequest.returnStatus?.toLowerCase();

    switch (step) {
      case 'requested':
        return true;

      case 'approved':
        return ['approved', 'productreceived', 'refundprocessing', 'completed'].includes(status);

      case 'received':
        return ['productreceived', 'refundprocessing', 'completed'].includes(status);

      case 'refund':
        return ['refundprocessing', 'completed'].includes(status);

      case 'completed':
        return status === 'completed';

      default:
        return false;
    }
  }

  // =========================================================
  // REJECTED CHECK
  // =========================================================

  isRejected(): boolean {
    return this.returnRequest?.returnStatus?.toLowerCase() === 'rejected';
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
}
