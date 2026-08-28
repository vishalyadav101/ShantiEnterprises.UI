// =========================================================
// BULK ENQUIRY MODEL
// Backend: BulkEnquiryResponseDto
// =========================================================

export interface BulkEnquiry {
  bulkEnquiryId: number;

  userId: number | null;

  customerName: string;

  mobile: string;

  email: string;

  productId: number | null;

  productName: string | null;

  quantity: number;

  message: string;

  status: string;

  createdDate: string;
}

// =========================================================
// CREATE BULK ENQUIRY
// Backend: BulkEnquiryCreateDto
// =========================================================

export interface CreateBulkEnquiry {
  userId?: number | null;

  customerName: string;

  mobile: string;

  email: string;

  productId?: number | null;

  quantity: number;

  message: string;
}

// =========================================================
// UPDATE BULK ENQUIRY
// Backend: BulkEnquiryUpdateDto
// =========================================================

export interface UpdateBulkEnquiry {
  customerName: string;

  mobile: string;

  email: string;

  productId?: number | null;

  quantity: number;

  message: string;

  status: string;
}
