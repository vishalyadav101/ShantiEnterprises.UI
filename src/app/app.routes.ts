import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

// =========================================================
// CUSTOMER LAYOUT
// =========================================================

import { CustomerLayout } from './layout/customer-layout/customer-layout/customer-layout';

// =========================================================
// ADMIN LAYOUT
// =========================================================

import { AdminLayout } from './layout/admin-layout/admin-layout';

// =========================================================
// CUSTOMER
// =========================================================

import { Home } from './features/home/home';

import { ProductList } from './features/products/product-list/product-list';

import { ProductDetail as CustomerProductDetail } from './features/products/product-detail/product-detail';

import { Wishlist } from './features/wishlist/wishlist';

import { CartComponent } from './features/cart/cart/cart';

import { AddressList } from './features/address/address-list/address-list';

import { AddressForm } from './features/address/address-form/address-form';

import { CheckoutComponent } from './features/checkout/checkout/checkout';

import { OrderDetailComponent } from './features/orders/order-detail/order-detail';

import { OrderList } from './features/orders/order-list/order-list';

// =========================================================
// ADMIN DASHBOARD
// =========================================================

import { Dashboard } from './features/dashboard/dashboard/dashboard';

// =========================================================
// ADMIN ORDERS
// =========================================================

import { AdminOrderListComponent } from './features/orders/admin-order-list/admin-order-list';

import { AdminOrderDetailComponent } from './features/orders/admin-order-detail/admin-order-detail';

// =========================================================
// ADMIN USERS
// =========================================================

import { UserList } from './features/admin-users/user-list/user-list';

import { UserDetail } from './features/admin-users/user-detail/user-detail';

import { UserEdit } from './features/admin-users/user-edit/user-edit';

// =========================================================
// ADMIN CATEGORIES
// =========================================================

import { CategoryList } from './features/categories/category-list/category-list';

import { CategoryDetail } from './features/categories/category-detail/category-detail';

import { CategoryForm } from './features/categories/category-form/category-form';

// =========================================================
// ADMIN PRODUCTS
// =========================================================

import { ProductList as AdminProductList } from './features/admin-products/product-list/product-list';

import { ProductDetail } from './features/admin-products/product-detail/product-detail';

import { ProductForm } from './features/admin-products/product-form/product-form';

import { ProductEdit } from './features/admin-products/product-edit/product-edit';

// =========================================================
// ADMIN BANNERS
// =========================================================

import { BannerList } from './features/banners/banner-list/banner-list';

import { BannerForm } from './features/banners/banner-form/banner-form';

import { BannerDetail } from './features/banners/banner-detail/banner-detail';

// =========================================================
// ADMIN REVIEWS
// =========================================================

import { AdminReviewList } from './features/admin-reviews/admin-review-list/admin-review-list';

// =========================================================
// ADMIN CONTACT ENQUIRIES
// =========================================================

import { ContactEnquiryList } from './features/contact-enquiries/contact-enquiry-list/contact-enquiry-list';

import { ContactEnquiryDetail } from './features/contact-enquiries/contact-enquiry-detail/contact-enquiry-detail';

import { ContactEnquiryForm } from './features/contact-enquiry/contact-enquiry-form/contact-enquiry-form';

// =========================================================
// ADMIN BULK ENQUIRIES
// =========================================================

import { BulkEnquiryList } from './features/bulk-enquiries/bulk-enquiry-list/bulk-enquiry-list';

import { BulkEnquiryDetail } from './features/bulk-enquiries/bulk-enquiry-detail/bulk-enquiry-detail';

// =========================================================
// ADMIN SHIPMENTS
// =========================================================

import { AdminShipmentsComponent } from './features/admin-shipments/admin-shipments';

// =========================================================
// RETURNS
// =========================================================

import { ReturnList } from './features/returns/return-list/return-list';

import { ReturnDetail } from './features/returns/return-detail/return-detail';

import { AdminReturns } from './features/admin-returns/admin-returns/admin-returns';

// =========================================================
// ROUTES
// =========================================================

export const routes: Routes = [
  // =========================================================
  // ADMIN LAYOUT
  // =========================================================
  // Admin ke saare pages adminGuard se protected hain.
  // =========================================================

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],

    children: [
      // =======================================================
      // DASHBOARD
      // =======================================================

      {
        path: '',
        component: Dashboard,
      },

      // =======================================================
      // ORDERS
      // =======================================================

      {
        path: 'orders',
        component: AdminOrderListComponent,
      },

      {
        path: 'orders/:id',
        component: AdminOrderDetailComponent,
      },

      // =======================================================
      // USERS
      // =======================================================

      {
        path: 'users',
        component: UserList,
      },

      {
        path: 'users/:id/edit',
        component: UserEdit,
      },

      {
        path: 'users/:id',
        component: UserDetail,
      },

      // =======================================================
      // CATEGORIES
      // =======================================================

      {
        path: 'categories',
        component: CategoryList,
      },

      {
        path: 'categories/new',
        component: CategoryForm,
      },

      {
        path: 'categories/:id/edit',
        component: CategoryForm,
      },

      {
        path: 'categories/:id',
        component: CategoryDetail,
      },

      // =======================================================
      // PRODUCTS
      // =======================================================

      {
        path: 'products',
        component: AdminProductList,
      },

      {
        path: 'products/new',
        component: ProductForm,
      },

      {
        path: 'products/:id/edit',
        component: ProductEdit,
      },

      {
        path: 'products/:id',
        component: ProductDetail,
      },

      // =======================================================
      // REVIEWS
      // =======================================================

      {
        path: 'reviews',
        component: AdminReviewList,
      },

      // =======================================================
      // CONTACT ENQUIRIES
      // =======================================================

      {
        path: 'contact-enquiries',
        component: ContactEnquiryList,
      },

      {
        path: 'contact-enquiries/:id',
        component: ContactEnquiryDetail,
      },

      // =======================================================
      // BULK ENQUIRIES
      // =======================================================

      {
        path: 'bulk-enquiries',
        component: BulkEnquiryList,
      },

      {
        path: 'bulk-enquiries/:id',
        component: BulkEnquiryDetail,
      },

      // =======================================================
      // SHIPMENTS
      // =======================================================

      {
        path: 'shipments',
        component: AdminShipmentsComponent,
      },

      // =======================================================
      // RETURNS
      // =======================================================

      {
        path: 'returns',
        component: AdminReturns,
      },

      // =======================================================
      // BANNERS
      // =======================================================

      {
        path: 'banners',
        component: BannerList,
      },

      {
        path: 'banners/new',
        component: BannerForm,
      },

      {
        path: 'banners/:id/edit',
        component: BannerForm,
      },

      {
        path: 'banners/:id',
        component: BannerDetail,
      },
    ],
  },

  // =========================================================
  // CUSTOMER LAYOUT
  // =========================================================
  //
  // IMPORTANT:
  // Yahan authGuard nahi hai.
  // Isliye Home aur Products public hain.
  // =========================================================

  {
    path: '',
    component: CustomerLayout,

    children: [
      // =======================================================
      // DEFAULT CUSTOMER PAGE
      // /
      // automatically /home par jayega
      // =======================================================

      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      // =======================================================
      // AUTH - PUBLIC
      // =======================================================
      // Login/Register CustomerLayout ke andar render honge.
      // Isliye same top navbar aur mobile bottom navigation
      // Login/Register pages par bhi available rahega.
      // =======================================================

      {
        path: 'login',
        component: Login,
      },

      {
        path: 'register',
        component: Register,
      },

      // =======================================================
      // HOME - PUBLIC
      // =======================================================

      {
        path: 'home',
        component: Home,
      },

      // =======================================================
      // PRODUCTS - PUBLIC
      // =======================================================

      {
        path: 'products',
        component: ProductList,
      },

      {
        path: 'products/:id',
        component: CustomerProductDetail,
      },

      // =======================================================
      // WISHLIST - LOGIN REQUIRED
      // =======================================================

      {
        path: 'wishlist',
        component: Wishlist,
        canActivate: [authGuard],
      },

      // =======================================================
      // CART - LOGIN REQUIRED
      // =======================================================

      {
        path: 'cart',
        component: CartComponent,
        canActivate: [authGuard],
      },

      // =======================================================
      // ADDRESSES - LOGIN REQUIRED
      // =======================================================

      {
        path: 'addresses',
        component: AddressList,
        canActivate: [authGuard],
      },

      {
        path: 'addresses/new',
        component: AddressForm,
        canActivate: [authGuard],
      },

      {
        path: 'addresses/edit/:id',
        component: AddressForm,
        canActivate: [authGuard],
      },

      // =======================================================
      // CHECKOUT - LOGIN REQUIRED
      // =======================================================

      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [authGuard],
      },

      // =======================================================
      // CONTACT US - LOGIN REQUIRED
      // =======================================================

      {
        path: 'contact',
        component: ContactEnquiryForm,
        canActivate: [authGuard],
      },

      // =======================================================
      // ORDERS - LOGIN REQUIRED
      // =======================================================

      {
        path: 'orders',
        component: OrderList,
        canActivate: [authGuard],
      },

      {
        path: 'orders/:id',
        component: OrderDetailComponent,
        canActivate: [authGuard],
      },

      // =======================================================
      // RETURNS & REFUNDS - LOGIN REQUIRED
      // =======================================================

      {
        path: 'returns',
        component: ReturnList,
        canActivate: [authGuard],
      },

      {
        path: 'returns/:id',
        component: ReturnDetail,
        canActivate: [authGuard],
      },
    ],
  },

  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // =========================================================
  // FALLBACK
  // =========================================================

  {
    path: '**',
    redirectTo: 'home',
  },
];
