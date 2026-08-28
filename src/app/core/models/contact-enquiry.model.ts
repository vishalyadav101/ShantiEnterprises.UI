// =========================================================
// CONTACT ENQUIRY MODEL
// Backend: ContactEnquiryResponseDto
// =========================================================

export interface ContactEnquiry {
  contactEnquiryId: number;

  fullName: string;

  email: string;

  mobile: string;

  subject: string;

  message: string;

  status: string;

  adminReply?: string | null;

  repliedDate?: string | null;

  createdDate: string;

  updatedDate?: string | null;
}

// =========================================================
// CREATE CONTACT ENQUIRY
// Backend: CreateContactEnquiryDto
// =========================================================

export interface CreateContactEnquiry {
  fullName: string;

  email: string;

  mobile: string;

  subject: string;

  message: string;
}

// =========================================================
// UPDATE CONTACT ENQUIRY
// Backend: UpdateContactEnquiryDto
// =========================================================

export interface UpdateContactEnquiry {
  status: string;

  adminReply?: string | null;
}
