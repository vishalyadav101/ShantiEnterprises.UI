export interface CartItem {
  cartItemId: number;

  productId: number;

  productName: string;

  imageUrl: string | null;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  gstPercentage: number;

  gstAmount: number;
}

export interface Cart {
  cartId: number;

  userId: number;

  items: CartItem[];

  subtotal: number;

  gstAmount: number;

  grandTotal: number;

  totalItems: number;
}

export interface AddCartItemRequest {
  productId: number;

  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}