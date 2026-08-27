// =========================================================
// BANNER MODEL
// Backend: BannerResponseDto
// =========================================================

export interface Banner {
  bannerId: number;

  title: string;

  subtitle: string;

  imageUrl: string;

  buttonText?: string | null;

  buttonUrl?: string | null;

  displayOrder: number;

  isActive: boolean;

  createdDate: string;
}

// =========================================================
// BANNER CREATE
// Backend: BannerCreateDto
//
// Image is uploaded as actual file using FormData.
// =========================================================

export interface BannerCreate {
  title: string;

  subtitle: string;

  image: File;

  buttonText?: string;

  buttonUrl?: string;

  displayOrder: number;

  isActive: boolean;
}

// =========================================================
// BANNER UPDATE
// Backend: BannerUpdateDto
//
// Image is optional during update.
// If selected, new image will be uploaded.
// =========================================================

export interface BannerUpdate {
  title: string;

  subtitle: string;

  image?: File | null;

  buttonText?: string;

  buttonUrl?: string;

  displayOrder: number;

  isActive: boolean;
}
