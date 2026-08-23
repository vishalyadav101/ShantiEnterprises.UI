export interface Address {
  addressId: number;

  userId: number;

  fullName: string;

  mobileNumber: string;

  addressLine1: string;

  addressLine2?: string | null;

  city: string;

  state: string;

  pincode: string;

  country: string;

  addressType: 'Home' | 'Office' | 'Other';

  isDefault: boolean;

  createdDate: string;
}

export interface AddressCreateRequest {
  fullName: string;

  mobileNumber: string;

  addressLine1: string;

  addressLine2?: string | null;

  city: string;

  state: string;

  pincode: string;

  country: string;

  addressType: 'Home' | 'Office' | 'Other';

  isDefault: boolean;
}

export interface AddressUpdateRequest {
  fullName: string;

  mobileNumber: string;

  addressLine1: string;

  addressLine2?: string | null;

  city: string;

  state: string;

  pincode: string;

  country: string;

  addressType: 'Home' | 'Office' | 'Other';

  isDefault: boolean;
}
