import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ShipmentService, ShipmentCreate, ShipmentUpdate } from '../../core/services/shipment';
import { Shipment } from '../../core/models/shipment.model';

@Component({
  selector: 'app-admin-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-shipments.html',
  styleUrl: './admin-shipments.scss',
})
export class AdminShipmentsComponent implements OnInit {
  private readonly shipmentService = inject(ShipmentService);

  // =========================================================
  // SHIPMENTS
  // =========================================================

  shipments: Shipment[] = [];

  filteredShipments: Shipment[] = [];

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  isLoading = false;

  isSaving = false;

  isDeleting = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  searchTerm = '';

  selectedStatus = '';

  // =========================================================
  // FORM
  // =========================================================

  isFormOpen = false;

  isEditMode = false;

  editingShipmentId: number | null = null;

  formData: ShipmentCreate & ShipmentUpdate = {
    orderId: 0,

    courierName: '',

    trackingNumber: '',

    trackingUrl: '',

    shippingMethod: 'Standard',

    estimatedDeliveryDate: '',

    deliveryNotes: '',

    shipmentStatus: 'Pending',

    statusDescription: '',

    deliveredTo: '',
  };

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  statusOptions = [
    'Pending',
    'Processing',
    'ReadyToShip',
    'Shipped',
    'InTransit',
    'OutForDelivery',
    'Delivered',
    'Cancelled',
    'Failed',
    'Returned',
  ];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadShipments();
  }

  // =========================================================
  // LOAD SHIPMENTS
  // =========================================================

  loadShipments(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.shipmentService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.shipments = response ?? [];

          this.applyFilters();
        },

        error: (error) => {
          console.error('Shipment List API Error:', error);

          this.shipments = [];

          this.filteredShipments = [];

          this.errorMessage = error?.error?.message || 'Unable to load shipments.';
        },
      });
  }

  // =========================================================
  // APPLY FILTERS
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    const status = this.selectedStatus.trim().toLowerCase();

    this.filteredShipments = this.shipments.filter((shipment) => {
      const matchesSearch =
        !search ||
        shipment.orderNumber?.toLowerCase().includes(search) ||
        shipment.courierName?.toLowerCase().includes(search) ||
        shipment.trackingNumber?.toLowerCase().includes(search);

      const matchesStatus = !status || shipment.shipmentStatus?.toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }

  // =========================================================
  // SEARCH CHANGE
  // =========================================================

  onSearchChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // STATUS CHANGE
  // =========================================================

  onStatusChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // OPEN CREATE FORM
  // =========================================================

  openCreateForm(): void {
    this.resetForm();

    this.isEditMode = false;

    this.editingShipmentId = null;

    this.isFormOpen = true;
  }

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  openEditForm(shipment: Shipment): void {
    this.isEditMode = true;

    this.editingShipmentId = shipment.shipmentId;

    this.formData = {
      orderId: shipment.orderId,

      courierName: shipment.courierName ?? '',

      trackingNumber: shipment.trackingNumber ?? '',

      trackingUrl: shipment.trackingUrl ?? '',

      shippingMethod: shipment.shippingMethod || 'Standard',

      estimatedDeliveryDate: this.toDateInput(shipment.estimatedDeliveryDate),

      deliveryNotes: shipment.deliveryNotes ?? '',

      shipmentStatus: shipment.shipmentStatus || 'Pending',

      statusDescription: shipment.statusDescription ?? '',

      deliveredTo: shipment.deliveredTo ?? '',
    };

    this.errorMessage = '';

    this.successMessage = '';

    this.isFormOpen = true;
  }

  // =========================================================
  // CLOSE FORM
  // =========================================================

  closeForm(): void {
    if (this.isSaving) {
      return;
    }

    this.isFormOpen = false;

    this.isEditMode = false;

    this.editingShipmentId = null;
  }

  // =========================================================
  // SAVE SHIPMENT
  // =========================================================

  saveShipment(): void {
    this.errorMessage = '';

    this.successMessage = '';

    if (this.isSaving) {
      return;
    }

    // =======================================================
    // CREATE
    // =======================================================

    if (!this.isEditMode) {
      if (!this.formData.orderId || this.formData.orderId <= 0) {
        this.errorMessage = 'Order ID is required.';

        return;
      }

      this.isSaving = true;

      const createData: ShipmentCreate = {
        orderId: this.formData.orderId,

        courierName: this.emptyToNull(this.formData.courierName),

        trackingNumber: this.emptyToNull(this.formData.trackingNumber),

        trackingUrl: this.emptyToNull(this.formData.trackingUrl),

        shippingMethod: this.formData.shippingMethod || 'Standard',

        estimatedDeliveryDate: this.toIsoDate(this.formData.estimatedDeliveryDate),

        deliveryNotes: this.emptyToNull(this.formData.deliveryNotes),
      };

      this.shipmentService
        .create(createData)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Shipment created successfully.';

            this.isFormOpen = false;

            this.loadShipments();
          },

          error: (error) => {
            console.error('Create Shipment Error:', error);

            this.errorMessage = error?.error?.message || 'Unable to create shipment.';
          },
        });

      return;
    }

    // =======================================================
    // UPDATE
    // =======================================================

    if (!this.editingShipmentId) {
      this.errorMessage = 'Invalid shipment ID.';

      return;
    }

    this.isSaving = true;

    const updateData: ShipmentUpdate = {
      courierName: this.emptyToNull(this.formData.courierName),

      trackingNumber: this.emptyToNull(this.formData.trackingNumber),

      trackingUrl: this.emptyToNull(this.formData.trackingUrl),

      shippingMethod: this.emptyToNull(this.formData.shippingMethod),

      shipmentStatus: this.formData.shipmentStatus || 'Pending',

      statusDescription: this.emptyToNull(this.formData.statusDescription),

      estimatedDeliveryDate: this.toIsoDate(this.formData.estimatedDeliveryDate),

      deliveredTo: this.emptyToNull(this.formData.deliveredTo),

      deliveryNotes: this.emptyToNull(this.formData.deliveryNotes),
    };

    this.shipmentService
      .update(this.editingShipmentId, updateData)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Shipment updated successfully.';

          this.isFormOpen = false;

          this.loadShipments();
        },

        error: (error) => {
          console.error('Update Shipment Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to update shipment.';
        },
      });
  }

  // =========================================================
  // DELETE SHIPMENT
  // =========================================================

  deleteShipment(shipment: Shipment): void {
    if (this.isDeleting || !shipment?.shipmentId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete shipment for order ${shipment.orderNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.shipmentService
      .delete(shipment.shipmentId)
      .pipe(
        finalize(() => {
          this.isDeleting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Shipment deleted successfully.';

          this.loadShipments();
        },

        error: (error) => {
          console.error('Delete Shipment Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to delete shipment.';
        },
      });
  }

  // =========================================================
  // VIEW TRACKING
  // =========================================================

  openTrackingUrl(shipment: Shipment): void {
    if (!shipment?.trackingUrl || !shipment.trackingUrl.trim()) {
      return;
    }

    window.open(shipment.trackingUrl, '_blank', 'noopener,noreferrer');
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';

      case 'processing':
        return 'status-processing';

      case 'readytoship':
        return 'status-ready';

      case 'shipped':
        return 'status-shipped';

      case 'intransit':
        return 'status-transit';

      case 'outfordelivery':
        return 'status-out';

      case 'delivered':
        return 'status-delivered';

      case 'cancelled':
        return 'status-cancelled';

      case 'failed':
        return 'status-failed';

      case 'returned':
        return 'status-returned';

      default:
        return 'status-default';
    }
  }

  // =========================================================
  // DATE FORMAT
  // =========================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  private resetForm(): void {
    this.formData = {
      orderId: 0,

      courierName: '',

      trackingNumber: '',

      trackingUrl: '',

      shippingMethod: 'Standard',

      estimatedDeliveryDate: '',

      deliveryNotes: '',

      shipmentStatus: 'Pending',

      statusDescription: '',

      deliveredTo: '',
    };

    this.errorMessage = '';

    this.successMessage = '';
  }

  // =========================================================
  // EMPTY STRING -> NULL
  // =========================================================

  private emptyToNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }

  // =========================================================
  // DATE TO ISO
  // =========================================================

  private toIsoDate(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  // =========================================================
  // ISO DATE -> HTML DATE
  // =========================================================

  private toDateInput(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
