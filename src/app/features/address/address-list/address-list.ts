import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AddressService } from '../../../core/services/address';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './address-list.html',
  styleUrl: './address-list.scss',
})
export class AddressList implements OnInit {
  private readonly addressService = inject(AddressService);

  addresses: Address[] = [];

  isLoading = false;

  isDeleting = false;

  deletingAddressId: number | null = null;

  settingDefaultId: number | null = null;

  errorMessage = '';

  successMessage = '';

  ngOnInit(): void {
    this.loadAddresses();
  }

  /**
   * Load current user's addresses
   */
  loadAddresses(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.addressService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Address API Response:', response);

          this.addresses = response;
        },

        error: (error) => {
          console.error('Address API Error:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load addresses.';
        },
      });
  }

  /**
   * Set address as default
   */
  setDefault(address: Address): void {
    if (address.isDefault || this.settingDefaultId !== null) {
      return;
    }

    this.settingDefaultId = address.addressId;

    this.errorMessage = '';

    this.addressService
      .setDefault(address.addressId)
      .pipe(
        finalize(() => {
          this.settingDefaultId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Set Default Response:', response);

          this.successMessage =
            'Default address updated successfully.';

          this.addresses = this.addresses.map((item) => ({
            ...item,
            isDefault: item.addressId === address.addressId,
          }));

          this.clearSuccessMessage();
        },

        error: (error) => {
          console.error('Set Default Address Error:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to set default address.';
        },
      });
  }

  /**
   * Delete address
   */
  deleteAddress(address: Address): void {
    if (this.isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the ${address.addressType.toLowerCase()} address?`,
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.deletingAddressId = address.addressId;

    this.errorMessage = '';

    this.addressService
      .delete(address.addressId)
      .pipe(
        finalize(() => {
          this.isDeleting = false;

          this.deletingAddressId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Delete Address Response:', response);

          this.addresses = this.addresses.filter(
            (item) =>
              item.addressId !== address.addressId,
          );

          this.successMessage =
            response?.message ||
            'Address deleted successfully.';

          this.clearSuccessMessage();
        },

        error: (error) => {
          console.error('Delete Address Error:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete address.';
        },
      });
  }

  /**
   * Clear success message
   */
  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Track addresses
   */
  trackByAddress(
    index: number,
    address: Address,
  ): number {
    return address.addressId;
  }
}