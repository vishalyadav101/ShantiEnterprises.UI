import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContactEnquiryService } from '../../../core/services/contact-enquiry';

@Component({
  selector: 'app-contact-enquiry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-enquiry-form.html',
  styleUrl: './contact-enquiry-form.scss',
})
export class ContactEnquiryForm {
  private readonly fb = inject(FormBuilder);

  private readonly contactEnquiryService = inject(ContactEnquiryService);

  // =========================================================
  // STATE
  // =========================================================

  isSubmitting = false;

  successMessage = '';

  errorMessage = '';

  // =========================================================
  // FORM
  // =========================================================

  contactForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],

    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],

    mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],

    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],

    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  // =========================================================
  // GET CONTROL
  // =========================================================

  get fullName() {
    return this.contactForm.controls.fullName;
  }

  get email() {
    return this.contactForm.controls.email;
  }

  get mobile() {
    return this.contactForm.controls.mobile;
  }

  get subject() {
    return this.contactForm.controls.subject;
  }

  get message() {
    return this.contactForm.controls.message;
  }

  // =========================================================
  // SUBMIT
  // POST /api/ContactEnquiry
  // PUBLIC
  // =========================================================

  submit(): void {
    this.successMessage = '';

    this.errorMessage = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    const formValue = this.contactForm.getRawValue();

    this.contactEnquiryService
      .create({
        fullName: formValue.fullName!.trim(),

        email: formValue.email!.trim(),

        mobile: formValue.mobile!.trim(),

        subject: formValue.subject!.trim(),

        message: formValue.message!.trim(),
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;

          this.successMessage =
            'Your enquiry has been submitted successfully. We will get back to you shortly.';

          this.contactForm.reset();
        },

        error: (error) => {
          console.error('Contact Enquiry Submit API Error:', error);

          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.message || 'Unable to submit your enquiry. Please try again.';
        },
      });
  }
}
