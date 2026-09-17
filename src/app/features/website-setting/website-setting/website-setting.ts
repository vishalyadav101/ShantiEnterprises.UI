import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WebsiteSettingService } from '../../../core/services/website-setting';
import { WebsiteSetting } from '../../../core/models/website-setting.model';

@Component({
  selector: 'app-website-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './website-setting.html',
  styleUrl: './website-setting.scss',
})
export class WebsiteSettingComponent implements OnInit {
  private readonly websiteSettingService = inject(WebsiteSettingService);

  setting: WebsiteSetting = {
    websiteSettingId: 0,
    companyName: 'Shanti Enterprises',
    logoUrl: null,
    faviconUrl: null,
    email: null,
    phone: null,
    whatsAppNumber: null,
    address: null,
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    linkedInUrl: null,
    youTubeUrl: null,
    footerText: null,
    updatedDate: null,
  };

  logoFile: File | null = null;
  faviconFile: File | null = null;

  logoPreview: string | null = null;
  faviconPreview: string | null = null;

  loading = false;
  saving = false;

  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.clearMessages();

    this.websiteSettingService.getSettings().subscribe({
      next: (response) => {
        this.setting = response;
        this.logoPreview = response.logoUrl;
        this.faviconPreview = response.faviconUrl;
        this.loading = false;
      },
      error: (error) => {
        console.error('Website Setting Load Error:', error);
        this.errorMessage = error?.error?.message || 'Unable to load website settings.';
        this.loading = false;
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!this.isValidImage(file)) {
      input.value = '';
      return;
    }

    this.logoFile = file;
    this.logoPreview = URL.createObjectURL(file);
    this.errorMessage = '';
  }

  onFaviconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!this.isValidImage(file)) {
      input.value = '';
      return;
    }

    this.faviconFile = file;
    this.faviconPreview = URL.createObjectURL(file);
    this.errorMessage = '';
  }

  save(): void {
    if (!this.setting.companyName?.trim()) {
      this.errorMessage = 'Company name is required.';
      return;
    }

    this.saving = true;
    this.clearMessages();

    const formData = new FormData();

    formData.append('CompanyName', this.setting.companyName.trim());

    this.appendIfValue(formData, 'Email', this.setting.email);
    this.appendIfValue(formData, 'Phone', this.setting.phone);
    this.appendIfValue(formData, 'WhatsAppNumber', this.setting.whatsAppNumber);
    this.appendIfValue(formData, 'Address', this.setting.address);
    this.appendIfValue(formData, 'FacebookUrl', this.setting.facebookUrl);
    this.appendIfValue(formData, 'InstagramUrl', this.setting.instagramUrl);
    this.appendIfValue(formData, 'TwitterUrl', this.setting.twitterUrl);
    this.appendIfValue(formData, 'LinkedInUrl', this.setting.linkedInUrl);
    this.appendIfValue(formData, 'YouTubeUrl', this.setting.youTubeUrl);
    this.appendIfValue(formData, 'FooterText', this.setting.footerText);

    if (this.logoFile) {
      formData.append('Logo', this.logoFile, this.logoFile.name);
    }

    if (this.faviconFile) {
      formData.append('Favicon', this.faviconFile, this.faviconFile.name);
    }

    this.websiteSettingService.saveSettings(formData).subscribe({
      next: (response) => {
        this.setting = response;
        this.logoPreview = response.logoUrl;
        this.faviconPreview = response.faviconUrl;

        this.logoFile = null;
        this.faviconFile = null;

        this.successMessage = 'Website settings saved successfully.';
        this.saving = false;
      },
      error: (error) => {
        console.error('Website Setting Save Error:', error);

        if (error?.status === 401 || error?.status === 403) {
          this.errorMessage = 'You are not authorized. Please login again with an Admin account.';
        } else {
          this.errorMessage = error?.error?.message || 'Unable to save website settings.';
        }

        this.saving = false;
      },
    });
  }

  private appendIfValue(formData: FormData, key: string, value: string | null | undefined): void {
    if (value?.trim()) {
      formData.append(key, value.trim());
    }
  }

  private isValidImage(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG, PNG, WEBP or ICO image files are allowed.';
      return false;
    }

    if (file.size > maxSize) {
      this.errorMessage = 'Image size must be 5 MB or less.';
      return false;
    }

    return true;
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
