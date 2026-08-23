import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AddressService } from '../../../core/services/address';
import { AddressCreateRequest, AddressUpdateRequest } from '../../../core/models/address.model';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.html',
  styleUrl: './address-form.scss',
})
export class AddressForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly addressService = inject(AddressService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  addressId: number | null = null;

  isEditMode = false;

  isLoading = false;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  addressForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],

    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],

    addressLine1: ['', [Validators.required, Validators.maxLength(250)]],

    addressLine2: ['', [Validators.maxLength(250)]],

    city: ['', [Validators.required, Validators.maxLength(100)]],

    state: ['', [Validators.required, Validators.maxLength(100)]],

    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],

    country: ['India', [Validators.maxLength(100)]],

    addressType: ['Home' as 'Home' | 'Office' | 'Other', Validators.required],

    isDefault: [false],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.addressId = Number(id);

      if (!Number.isNaN(this.addressId)) {
        this.isEditMode = true;

        this.loadAddress(this.addressId);
      }
    }
  }

  /**
   * Load address for edit
   */
  loadAddress(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.addressService
      .getById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (address) => {
          this.addressForm.patchValue({
            fullName: address.fullName,

            mobileNumber: address.mobileNumber,

            addressLine1: address.addressLine1,

            addressLine2: address.addressLine2 ?? '',

            city: address.city,

            state: address.state,

            pincode: address.pincode,

            country: address.country,

            addressType: address.addressType,

            isDefault: address.isDefault,
          });
        },

        error: (error) => {
          console.error('Get Address Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load address.';
        },
      });
  }

  /**
   * Save address
   */
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();

      return;
    }

    this.isSaving = true;

    this.errorMessage = '';

    this.successMessage = '';

    const formValue = this.addressForm.getRawValue();

    if (this.isEditMode && this.addressId) {
      const request: AddressUpdateRequest = {
        fullName: formValue.fullName.trim(),

        mobileNumber: formValue.mobileNumber.trim(),

        addressLine1: formValue.addressLine1.trim(),

        addressLine2: formValue.addressLine2.trim() || null,

        city: formValue.city.trim(),

        state: formValue.state.trim(),

        pincode: formValue.pincode.trim(),

        country: formValue.country.trim(),

        addressType: formValue.addressType,

        isDefault: formValue.isDefault,
      };

      this.addressService
        .update(this.addressId, request)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Address updated successfully.';

            setTimeout(() => {
              this.router.navigate(['/addresses']);
            }, 800);
          },

          error: (error) => {
            console.error('Update Address Error:', error);

            this.errorMessage = error?.error?.message || 'Unable to update address.';
          },
        });

      return;
    }

    const request: AddressCreateRequest = {
      fullName: formValue.fullName.trim(),

      mobileNumber: formValue.mobileNumber.trim(),

      addressLine1: formValue.addressLine1.trim(),

      addressLine2: formValue.addressLine2.trim() || null,

      city: formValue.city.trim(),

      state: formValue.state.trim(),

      pincode: formValue.pincode.trim(),

      country: formValue.country.trim(),

      addressType: formValue.addressType,

      isDefault: formValue.isDefault,
    };

    this.addressService
      .create(request)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Address added successfully.';

          setTimeout(() => {
            this.router.navigate(['/addresses']);
          }, 800);
        },

        error: (error) => {
          console.error('Create Address Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to add address.';
        },
      });
  }

  /**
   * Navigate back to address list
   */
  cancel(): void {
    this.router.navigate(['/addresses']);
  }

  /**
   * Form field helper
   */
  isInvalid(controlName: string): boolean {
    const control = this.addressForm.get(controlName);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
