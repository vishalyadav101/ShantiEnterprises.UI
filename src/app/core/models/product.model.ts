// =========================================================
// PRODUCT
// =========================================================

export interface Product {
  productId: number;

  productName: string;

  description: string;

  categoryId: number;

  categoryName: string;

  // Original MRP
  mrp: number;

  // Normal customer selling price
  retailPrice: number;

  // Admin/base wholesale price
  wholesalePrice: number;

  // Shipping charge per product line
  shippingCharge: number;

  stock: number;

  gstPercentage: number;

  sku: string;

  imageUrl: string | null;

  isActive: boolean;

  createdDate: string;

  // Admin-defined quantity price tiers
  priceTiers?: ProductPriceTier[];
}

// =========================================================
// PRODUCT IMAGE
// =========================================================

export interface ProductImage {
  productImageId: number;

  productId: number;

  imageUrl: string;

  isPrimary: boolean;
}

// =========================================================
// PRODUCT PRICE TIER
// =========================================================

export interface ProductPriceTier {
  productPriceTierId: number;

  productId: number;

  minQuantity: number;

  maxQuantity: number | null;

  price: number;
}
