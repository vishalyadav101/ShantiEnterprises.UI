export interface Product {
  productId: number;

  productName: string;

  description: string;

  categoryId: number;

  categoryName: string;

  mrp: number;

  wholesalePrice: number;

  stock: number;

  gstPercentage: number;

  sku: string;

  imageUrl: string | null;

  isActive: boolean;

  createdDate: string;
}
