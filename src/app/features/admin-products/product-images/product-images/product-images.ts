import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ProductImageService, ProductImage } from '../../../../core/services/product-image';

@Component({
  selector: 'app-product-images',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-images.html',
  styleUrl: './product-images.scss',
})
export class ProductImages implements OnChanges {
  private readonly productImageService = inject(ProductImageService);

  // =========================================================
  // INPUT
  // =========================================================

  @Input() productId = 0;

  // =========================================================
  // DATA
  // =========================================================

  images: ProductImage[] = [];

  // =========================================================
  // SELECTED FILE
  // =========================================================

  selectedFile: File | null = null;

  isPrimary = false;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isUploading = false;

  deletingImageId: number | null = null;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId > 0) {
      this.loadImages();
    }
  }

  // =========================================================
  // LOAD IMAGES
  // =========================================================

  loadImages(): void {
    if (!this.productId) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    this.productImageService
      .getByProductId(this.productId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (images: ProductImage[]) => {
          console.log('Product Images:', images);

          this.images = images;
        },

        error: (error: any) => {
          console.error('Product Images Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load product images.';
        },
      });
  }

  // =========================================================
  // FILE SELECT
  // =========================================================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;

      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    const file = input.files[0];

    // -------------------------------------------------------
    // FILE TYPE
    // -------------------------------------------------------

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG, JPEG, PNG and WEBP images are allowed.';

      input.value = '';

      this.selectedFile = null;

      return;
    }

    // -------------------------------------------------------
    // FILE SIZE
    // -------------------------------------------------------

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage = 'Image size cannot be greater than 5 MB.';

      input.value = '';

      this.selectedFile = null;

      return;
    }

    // -------------------------------------------------------
    // SAVE FILE
    // -------------------------------------------------------

    this.selectedFile = file;
  }

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  uploadImage(): void {
    if (this.isUploading) {
      return;
    }

    if (!this.productId) {
      this.errorMessage = 'Invalid product ID.';

      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Please select an image.';

      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    this.isUploading = true;

    this.productImageService
      .upload(this.productId, this.selectedFile, this.isPrimary)
      .pipe(
        finalize(() => {
          this.isUploading = false;
        }),
      )
      .subscribe({
        next: (image: ProductImage) => {
          console.log('Image Uploaded:', image);

          this.successMessage = 'Product image uploaded successfully.';

          this.selectedFile = null;

          this.isPrimary = false;

          this.loadImages();
        },

        error: (error: any) => {
          console.error('Image Upload Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to upload product image.';
        },
      });
  }

  // =========================================================
  // DELETE IMAGE
  // =========================================================

  deleteImage(image: ProductImage): void {
    if (this.deletingImageId !== null) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this image?');

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    this.deletingImageId = image.productImageId;

    this.productImageService
      .delete(image.productImageId)
      .pipe(
        finalize(() => {
          this.deletingImageId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Product image deleted successfully.';

          this.images = this.images.filter(
            (item: ProductImage) => item.productImageId !== image.productImageId,
          );
        },

        error: (error: any) => {
          console.error('Image Delete Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to delete product image.';
        },
      });
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // SELECTED FILE NAME
  // =========================================================

  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }

  // =========================================================
  // SELECTED FILE SIZE
  // =========================================================

  get selectedFileSize(): string {
    if (!this.selectedFile) {
      return '';
    }

    const size = this.selectedFile.size;

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
