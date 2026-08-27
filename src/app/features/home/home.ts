import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, finalize, Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { ProductService } from '../../core/services/product';
import { WishlistService, WishlistItem } from '../../core/services/wishlist';
import { CartService } from '../../core/services/cart';
import { ProductImageService, ProductImage } from '../../core/services/product-image';
import { OrderService } from '../../core/services/order';
import { BannerService, Banner } from '../../core/services/banner';

import { Product } from '../../core/models/product.model';
import { Cart } from '../../core/models/cart.model';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly authService = inject(AuthService);

  private readonly productService = inject(ProductService);

  private readonly wishlistService = inject(WishlistService);

  private readonly cartService = inject(CartService);

  private readonly productImageService = inject(ProductImageService);

  private readonly orderService = inject(OrderService);

  private readonly bannerService = inject(BannerService);

  private readonly router = inject(Router);

  // =========================================================
  // USER
  // =========================================================

  user = this.authService.getCurrentUser();

  // =========================================================
  // BANNERS
  // =========================================================

  banners: Banner[] = [];

  currentBannerIndex = 0;

  private bannerIntervalId: ReturnType<typeof setInterval> | null = null;

  // =========================================================
  // PRODUCTS
  // =========================================================

  products: Product[] = [];

  featuredProducts: Product[] = [];

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  productImages: Record<number, ProductImage[]> = {};

  currentImageIndex: Record<number, number> = {};

  isLoadingImages: Record<number, boolean> = {};

  // =========================================================
  // WISHLIST
  // =========================================================

  wishlistItems: WishlistItem[] = [];

  wishlistProductIds = new Set<number>();

  wishlistCount = 0;

  isWishlistLoading = false;

  wishlistActionProductId: number | null = null;

  // =========================================================
  // CART
  // =========================================================

  cart: Cart | null = null;

  cartItemCount = 0;

  cartTotal = 0;

  isCartLoading = false;

  isAddingToCart = false;

  addingProductId: number | null = null;

  // =========================================================
  // ORDERS
  // =========================================================

  orders: Order[] = [];

  recentOrders: Order[] = [];

  orderCount = 0;

  isOrdersLoading = false;

  // =========================================================
  // PAGE STATE
  // =========================================================

  isLoading = false;

  errorMessage = '';

  cartMessage = '';

  wishlistMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadHomeData();
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {
    this.stopBannerAutoSlide();
  }

  // =========================================================
  // LOAD HOME DATA
  // =========================================================

  loadHomeData(): void {
    this.isLoading = true;

    this.errorMessage = '';

    // Stop previous banner timer
    this.stopBannerAutoSlide();

    forkJoin({
      products: this.productService.getAll(),

      wishlist: this.wishlistService.getWishlist(),

      cart: this.cartService.getCart(),

      orders: this.orderService.getMyOrders(),

      banners: this.bannerService.getAll(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          // =================================================
          // BANNERS
          // =================================================

          this.banners = (response.banners || [])
            .filter((banner) => banner.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);

          this.currentBannerIndex = 0;

          if (this.banners.length > 1) {
            this.startBannerAutoSlide();
          }

          // =================================================
          // PRODUCTS
          // =================================================

          this.products = response.products.filter((product) => product.isActive);

          /*
           * Show maximum 8 products on Home page.
           */

          this.featuredProducts = this.products.slice(0, 8);

          /*
           * Load images for featured products.
           */

          this.featuredProducts.forEach((product) => {
            this.loadProductImages(product);
          });

          // =================================================
          // WISHLIST
          // =================================================

          this.wishlistItems = response.wishlist.items || [];

          this.wishlistCount = response.wishlist.totalItems || 0;

          this.wishlistProductIds = new Set(
            this.wishlistItems.filter((item) => item.isActive).map((item) => item.productId),
          );

          // =================================================
          // CART
          // =================================================

          this.cart = response.cart;

          this.cartItemCount = response.cart?.totalItems || 0;

          this.cartTotal = response.cart?.grandTotal || 0;

          // =================================================
          // ORDERS
          // =================================================

          this.orders = response.orders || [];

          this.orderCount = this.orders.length;

          /*
           * Latest 3 orders.
           */

          this.recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
            .slice(0, 3);

          console.log('Home Data:', response);
        },

        error: (error) => {
          console.error('Home API Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load home page data.';
        },
      });
  }

  // =========================================================
  // LOAD BANNER AUTO SLIDE
  // =========================================================

  private startBannerAutoSlide(): void {
    this.stopBannerAutoSlide();

    this.bannerIntervalId = setInterval(() => {
      if (this.banners.length <= 1) {
        return;
      }

      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, 5000);
  }

  // =========================================================
  // STOP BANNER AUTO SLIDE
  // =========================================================

  private stopBannerAutoSlide(): void {
    if (this.bannerIntervalId !== null) {
      clearInterval(this.bannerIntervalId);

      this.bannerIntervalId = null;
    }
  }

  // =========================================================
  // NEXT BANNER
  // =========================================================

  nextBanner(): void {
    if (this.banners.length <= 1) {
      return;
    }

    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
  }

  // =========================================================
  // PREVIOUS BANNER
  // =========================================================

  previousBanner(): void {
    if (this.banners.length <= 1) {
      return;
    }

    this.currentBannerIndex =
      this.currentBannerIndex === 0 ? this.banners.length - 1 : this.currentBannerIndex - 1;
  }

  // =========================================================
  // SELECT BANNER
  // =========================================================

  selectBanner(index: number): void {
    if (index < 0 || index >= this.banners.length) {
      return;
    }

    this.currentBannerIndex = index;
  }

  // =========================================================
  // BANNER IMAGE URL
  // =========================================================

  getBannerImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // BANNER BUTTON
  // =========================================================

  openBannerUrl(buttonUrl: string | null | undefined): void {
    if (!buttonUrl) {
      return;
    }

    if (buttonUrl.startsWith('http://') || buttonUrl.startsWith('https://')) {
      window.location.href = buttonUrl;
      return;
    }

    this.router.navigateByUrl(buttonUrl);
  }

  // =========================================================
  // LOAD PRODUCT IMAGES
  // =========================================================

  private loadProductImages(product: Product): void {
    this.isLoadingImages[product.productId] = true;

    this.productImageService
      .getByProductId(product.productId)
      .pipe(
        finalize(() => {
          this.isLoadingImages[product.productId] = false;
        }),
      )
      .subscribe({
        next: (images) => {
          /*
           * Primary image always comes first.
           */

          const sortedImages = [...images].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) {
              return -1;
            }

            if (!a.isPrimary && b.isPrimary) {
              return 1;
            }

            return a.productImageId - b.productImageId;
          });

          /*
           * If ProductImage API returns images.
           */

          if (sortedImages.length > 0) {
            this.productImages[product.productId] = sortedImages;
          }

          /*
           * Fallback to Product.imageUrl.
           */
          else if (product.imageUrl) {
            this.productImages[product.productId] = [
              {
                productImageId: 0,

                productId: product.productId,

                imageUrl: product.imageUrl,

                isPrimary: true,
              },
            ];
          } else {
            this.productImages[product.productId] = [];
          }

          this.currentImageIndex[product.productId] = 0;
        },

        error: (error) => {
          console.error(`Product Image Error (${product.productId}):`, error);

          if (product.imageUrl) {
            this.productImages[product.productId] = [
              {
                productImageId: 0,

                productId: product.productId,

                imageUrl: product.imageUrl,

                isPrimary: true,
              },
            ];
          } else {
            this.productImages[product.productId] = [];
          }

          this.currentImageIndex[product.productId] = 0;
        },
      });
  }

  // =========================================================
  // GET PRODUCT IMAGES
  // =========================================================

  getImages(product: Product): ProductImage[] {
    return this.productImages[product.productId] || [];
  }

  // =========================================================
  // CURRENT IMAGE
  // =========================================================

  getCurrentImage(product: Product): ProductImage | null {
    const images = this.getImages(product);

    if (images.length === 0) {
      return null;
    }

    const index = this.currentImageIndex[product.productId] ?? 0;

    return images[index] || images[0];
  }

  // =========================================================
  // CURRENT IMAGE URL
  // =========================================================

  getCurrentImageUrl(product: Product): string {
    const image = this.getCurrentImage(product);

    if (!image?.imageUrl) {
      return '';
    }

    return this.getImageUrl(image.imageUrl);
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // NEXT IMAGE
  // =========================================================

  nextImage(product: Product): void {
    const images = this.getImages(product);

    if (images.length <= 1) {
      return;
    }

    const currentIndex = this.currentImageIndex[product.productId] ?? 0;

    this.currentImageIndex[product.productId] = (currentIndex + 1) % images.length;
  }

  // =========================================================
  // PREVIOUS IMAGE
  // =========================================================

  previousImage(product: Product): void {
    const images = this.getImages(product);

    if (images.length <= 1) {
      return;
    }

    const currentIndex = this.currentImageIndex[product.productId] ?? 0;

    this.currentImageIndex[product.productId] =
      currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  }

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  selectImage(product: Product, index: number): void {
    const images = this.getImages(product);

    if (index < 0 || index >= images.length) {
      return;
    }

    this.currentImageIndex[product.productId] = index;
  }

  // =========================================================
  // IMAGE LOADING
  // =========================================================

  isImageLoading(product: Product): boolean {
    return !!this.isLoadingImages[product.productId];
  }

  // =========================================================
  // WISHLIST CHECK
  // =========================================================

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.has(productId);
  }

  // =========================================================
  // TOGGLE WISHLIST
  // =========================================================

  toggleWishlist(product: Product): void {
    if (this.wishlistActionProductId !== null) {
      return;
    }

    this.wishlistActionProductId = product.productId;

    this.wishlistMessage = '';

    // =======================================================
    // REMOVE
    // =======================================================

    if (this.isInWishlist(product.productId)) {
      this.wishlistService
        .removeFromWishlist(product.productId)
        .pipe(
          finalize(() => {
            this.wishlistActionProductId = null;
          }),
        )
        .subscribe({
          next: (response) => {
            this.wishlistItems = response.items || [];

            this.wishlistCount = response.totalItems || 0;

            this.wishlistProductIds = new Set(
              this.wishlistItems.filter((item) => item.isActive).map((item) => item.productId),
            );

            this.wishlistMessage = `${product.productName} removed from wishlist.`;

            this.clearWishlistMessage();
          },

          error: (error) => {
            console.error('Remove Wishlist Error:', error);

            this.wishlistMessage = error?.error?.message || 'Unable to remove from wishlist.';

            this.clearWishlistMessage();
          },
        });

      return;
    }

    // =======================================================
    // ADD
    // =======================================================

    this.wishlistService
      .addToWishlist(product.productId)
      .pipe(
        finalize(() => {
          this.wishlistActionProductId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          this.wishlistItems = response.items || [];

          this.wishlistCount = response.totalItems || 0;

          this.wishlistProductIds = new Set(
            this.wishlistItems.filter((item) => item.isActive).map((item) => item.productId),
          );

          this.wishlistMessage = `${product.productName} added to wishlist.`;

          this.clearWishlistMessage();
        },

        error: (error) => {
          console.error('Add Wishlist Error:', error);

          this.wishlistMessage = error?.error?.message || 'Unable to add to wishlist.';

          this.clearWishlistMessage();
        },
      });
  }

  // =========================================================
  // CLEAR WISHLIST MESSAGE
  // =========================================================

  private clearWishlistMessage(): void {
    setTimeout(() => {
      this.wishlistMessage = '';
    }, 3000);
  }

  // =========================================================
  // ADD TO CART
  // =========================================================

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      return;
    }

    if (this.isAddingToCart) {
      return;
    }

    this.isAddingToCart = true;

    this.addingProductId = product.productId;

    this.cartMessage = '';

    this.cartService
      .addItem({
        productId: product.productId,

        quantity: 1,
      })
      .pipe(
        finalize(() => {
          this.isAddingToCart = false;

          this.addingProductId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          this.cart = response;

          this.cartItemCount = response.totalItems || 0;

          this.cartTotal = response.grandTotal || 0;

          this.cartMessage = `${product.productName} added to cart.`;

          setTimeout(() => {
            this.cartMessage = '';
          }, 3000);
        },

        error: (error) => {
          console.error('Add To Cart Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to add product to cart.';
        },
      });
  }

  // =========================================================
  // GO TO CART
  // =========================================================

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // =========================================================
  // GO TO WISHLIST
  // =========================================================

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  // =========================================================
  // GO TO ORDERS
  // =========================================================

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  // =========================================================
  // GO TO ADDRESSES
  // =========================================================

  goToAddresses(): void {
    this.router.navigate(['/addresses']);
  }

  // =========================================================
  // VIEW PRODUCT
  // =========================================================

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  // =========================================================
  // VIEW ORDER
  // =========================================================

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }

  // =========================================================
  // ORDER STATUS CLASS
  // =========================================================

  getOrderStatusClass(status: string): string {
    if (!status) {
      return 'status-default';
    }

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('deliver') || normalizedStatus.includes('complete')) {
      return 'status-success';
    }

    if (normalizedStatus.includes('cancel') || normalizedStatus.includes('reject')) {
      return 'status-danger';
    }

    if (normalizedStatus.includes('pending') || normalizedStatus.includes('process')) {
      return 'status-warning';
    }

    if (normalizedStatus.includes('ship')) {
      return 'status-info';
    }

    return 'status-default';
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(date: string): string {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
