import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { BannerService } from '../../../core/services/banner';
import { Banner, BannerCreate, BannerUpdate } from '../../../core/models/banner.model';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './banner-form.html',
  styleUrl: './banner-form.scss',
})
export class BannerForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly bannerService = inject(BannerService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  // =========================================================
  // EDIT MODE
  // =========================================================

  isEditMode = false;

  bannerId: number | null = null;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // IMAGE
  // =========================================================

  selectedImage: File | null = null;

  imagePreview: string | null = null;

  existingImageUrl: string | null = null;

  // =========================================================
  // FORM
  // =========================================================

  bannerForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],

    subtitle: ['', [Validators.required, Validators.maxLength(250)]],

    buttonText: ['', Validators.maxLength(50)],

    buttonUrl: ['', Validators.maxLength(500)],

    displayOrder: [1, [Validators.required, Validators.min(0)]],

    isActive: [true],
  });

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.bannerId = Number(id);

      this.loadBanner(this.bannerId);
    }
  }

  // =========================================================
  // LOAD BANNER FOR EDIT
  // =========================================================

  loadBanner(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.bannerService
      .getById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (banner) => {
          this.setFormData(banner);
        },

        error: (error: unknown) => {
          console.error('Load Banner Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load banner.');
        },
      });
  }

  // =========================================================
  // SET FORM DATA
  // =========================================================

  private setFormData(banner: Banner): void {
    this.bannerForm.patchValue({
      title: banner.title,

      subtitle: banner.subtitle,

      buttonText: banner.buttonText ?? '',

      buttonUrl: banner.buttonUrl ?? '',

      displayOrder: banner.displayOrder,

      isActive: banner.isActive,
    });

    this.existingImageUrl = banner.imageUrl;
  }

  // =========================================================
  // IMAGE SELECT
  // =========================================================

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // -----------------------------------------
    // Validate file type
    // -----------------------------------------

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG, JPEG, PNG and WEBP images are allowed.';

      input.value = '';

      return;
    }

    // -----------------------------------------
    // Validate file size
    // -----------------------------------------

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage = 'Image size cannot be greater than 5 MB.';

      input.value = '';

      return;
    }

    // -----------------------------------------
    // Save selected file
    // -----------------------------------------

    this.errorMessage = '';

    this.selectedImage = file;

    // -----------------------------------------
    // Create preview
    // -----------------------------------------

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // =========================================================
  // REMOVE SELECTED IMAGE
  // =========================================================

  removeSelectedImage(): void {
    this.selectedImage = null;

    this.imagePreview = null;

    const fileInput = document.getElementById('bannerImage') as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {
    this.errorMessage = '';

    this.successMessage = '';

    // -----------------------------------------
    // Validate form
    // -----------------------------------------

    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();

      this.errorMessage = 'Please fill all required fields correctly.';

      return;
    }

    // -----------------------------------------
    // Image required for CREATE
    // -----------------------------------------

    if (!this.isEditMode && !this.selectedImage) {
      this.errorMessage = 'Please select a banner image.';

      return;
    }

    // -----------------------------------------
    // Prevent duplicate submit
    // -----------------------------------------

    if (this.isSubmitting) {
      return;
    }

    // -----------------------------------------
    // Form values
    // -----------------------------------------

    const value = this.bannerForm.getRawValue();

    const title = value.title?.trim() ?? '';

    const subtitle = value.subtitle?.trim() ?? '';

    const buttonText = value.buttonText?.trim() ?? '';

    const buttonUrl = value.buttonUrl?.trim() ?? '';

    const displayOrder = Number(value.displayOrder ?? 0);

    const isActive = value.isActive ?? true;

    // -----------------------------------------
    // Start submit
    // -----------------------------------------

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.updateBanner({
        title,
        subtitle,
        buttonText,
        buttonUrl,
        displayOrder,
        isActive,
        image: this.selectedImage,
      });

      return;
    }

    this.createBanner({
      title,
      subtitle,
      buttonText,
      buttonUrl,
      displayOrder,
      isActive,
      image: this.selectedImage!,
    });
  }

  // =========================================================
  // CREATE
  // =========================================================

  private createBanner(data: BannerCreate): void {
    this.bannerService
      .create(data)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (banner) => {
          console.log('Banner Created:', banner);

          this.successMessage = 'Banner created successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/banners']);
          }, 800);
        },

        error: (error: unknown) => {
          console.error('Create Banner Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to create banner.');
        },
      });
  }

  // =========================================================
  // UPDATE
  // =========================================================

  private updateBanner(data: BannerUpdate): void {
    if (!this.bannerId) {
      this.isSubmitting = false;

      this.errorMessage = 'Invalid banner ID.';

      return;
    }

    this.bannerService
      .update(this.bannerId, data)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (banner) => {
          console.log('Banner Updated:', banner);

          this.successMessage = 'Banner updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/banners']);
          }, 800);
        },

        error: (error: unknown) => {
          console.error('Update Banner Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update banner.');
        },
      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    this.router.navigate(['/admin/banners']);
  }

  // =========================================================
  // FIELD HELPERS
  // =========================================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bannerForm.get(fieldName);

    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        error?: {
          message?: string;
        };
      };

      return apiError.error?.message || fallback;
    }

    return fallback;
  }
}
