// =========================================================
// PRODUCT PRICE TIER
// =========================================================

export interface ProductPriceTier {
  productPriceTierId?: number;

  productId: number;

  minQuantity: number;

  maxQuantity: number | null;

  price: number;
}

// =========================================================
// CART ITEM
// =========================================================

export interface CartItem {
  cartItemId: number;

  productId: number;

  productName: string;

  imageUrl: string | null;

  quantity: number;

  // =======================================================
  // NORMAL CUSTOMER PRICE
  // =======================================================

  retailPrice: number;

  // =======================================================
  // CURRENT APPLIED PRICE
  //
  // This can be:
  // - Retail price
  // - Matching price tier price
  // =======================================================

  unitPrice: number;

  totalPrice: number;

  // =======================================================
  // GST
  // =======================================================

  gstPercentage: number;

  gstAmount: number;

  // =======================================================
  // ADMIN DEFINED PRICE TIERS
  // =======================================================

  priceTiers: ProductPriceTier[];
}

// =========================================================
// CART
// =========================================================

export interface Cart {
  cartId: number;

  userId: number;

  items: CartItem[];

  subtotal: number;

  gstAmount: number;

  shippingCharge: number;

  grandTotal: number;

  totalItems: number;
}

// =========================================================
// ADD CART ITEM REQUEST
// =========================================================

export interface AddCartItemRequest {
  productId: number;

  quantity: number;
}

// =========================================================
// UPDATE CART ITEM REQUEST
// =========================================================

export interface UpdateCartItemRequest {
  quantity: number;
}
