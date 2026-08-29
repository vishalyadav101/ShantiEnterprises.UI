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
import { BannerList } from './features/banners/banner-list/banner-list';
import { BannerForm } from './features/banners/banner-form/banner-form';
import { BannerDetail } from './features/banners/banner-detail/banner-detail';
import { AdminReviewList } from './features/admin-reviews/admin-review-list/admin-review-list';
import { ContactEnquiryList } from './features/contact-enquiries/contact-enquiry-list/contact-enquiry-list';

import { ContactEnquiryDetail } from './features/contact-enquiries/contact-enquiry-detail/contact-enquiry-detail';
import { ContactEnquiryForm } from './features/contact-enquiry/contact-enquiry-form/contact-enquiry-form';
import { BulkEnquiryList } from './features/bulk-enquiries/bulk-enquiry-list/bulk-enquiry-list';
import { BulkEnquiryDetail } from './features/bulk-enquiries/bulk-enquiry-detail/bulk-enquiry-detail';
import { AdminShipmentsComponent } from './features/admin-shipments/admin-shipments';
import { ReturnList } from './features/returns/return-list/return-list';
import { ReturnDetail } from './features/returns/return-detail/return-detail';
import { AdminReturns } from './features/admin-returns/admin-returns/admin-returns'; // =========================================================
// ROUTES
// =========================================================

export const routes: Routes = [
  // =========================================================
  // AUTH
  // =========================================================

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'register',
    component: Register,
  },

  // =========================================================
  // ADMIN DASHBOARD
  // =========================================================

  {
    path: 'admin',
    component: Dashboard,
    canActivate: [adminGuard],
  },

  // =========================================================
  // ADMIN ORDERS
  // =========================================================

  {
    path: 'admin/orders',
    component: AdminOrderListComponent,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/orders/:id',
    component: AdminOrderDetailComponent,
    canActivate: [adminGuard],
  },

  // =========================================================
  // ADMIN USERS
  // =========================================================

  {
    path: 'admin/users',
    component: UserList,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/users/:id',
    component: UserDetail,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/users/:id/edit',
    component: UserEdit,
    canActivate: [adminGuard],
  },

  // =========================================================
  // ADMIN CATEGORIES
  // =========================================================

  {
    path: 'admin/categories',
    component: CategoryList,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/categories/new',
    component: CategoryForm,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/categories/:id/edit',
    component: CategoryForm,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/categories/:id',
    component: CategoryDetail,
    canActivate: [adminGuard],
  },

  // =========================================================
  // ADMIN PRODUCTS
  // =========================================================

  {
    path: 'admin/products',
    component: AdminProductList,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/products/new',
    component: ProductForm,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/products/:id/edit',
    component: ProductEdit,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/products/:id',
    component: ProductDetail,
    canActivate: [adminGuard],
  },
  // =========================================================
  // ADMIN REVIEWS
  // =========================================================

  {
    path: 'admin/reviews',
    component: AdminReviewList,
    canActivate: [adminGuard],
  },
  // =========================================================
  // ADMIN CONTACT ENQUIRIES
  // =========================================================

  {
    path: 'admin/contact-enquiries',
    component: ContactEnquiryList,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/contact-enquiries/:id',
    component: ContactEnquiryDetail,
    canActivate: [adminGuard],
  },
  // =========================================================
  // ADMIN BULK ENQUIRIES
  //==========================================================
  {
    path: 'admin/bulk-enquiries',
    component: BulkEnquiryList,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/bulk-enquiries/:id',
    component: BulkEnquiryDetail,
    canActivate: [adminGuard],
  },
  // =========================================================
  // ADMIN SHIPMENTS
  // =========================================================

  {
    path: 'admin/shipments',
    component: AdminShipmentsComponent,
    canActivate: [adminGuard],
  },
  // =========================================================
  // ADMIN RETURNS
  // =========================================================

  {
    path: 'admin/returns',
    component: AdminReturns,
    canActivate: [adminGuard],
  },
  // =========================================================
  // ADMIN BANNERS
  // =========================================================

  {
    path: 'admin/banners',
    component: BannerList,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/banners/new',
    component: BannerForm,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/banners/:id/edit',
    component: BannerForm,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/banners/:id',
    component: BannerDetail,
    canActivate: [adminGuard],
  },
  // =========================================================
  // CUSTOMER LAYOUT
  // =========================================================

  {
    path: '',
    component: CustomerLayout,
    canActivate: [authGuard],

    children: [
      // =======================================================
      // HOME
      // =======================================================

      {
        path: 'home',
        component: Home,
      },

      // =======================================================
      // PRODUCTS
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
      // WISHLIST
      // =======================================================

      {
        path: 'wishlist',
        component: Wishlist,
      },

      // =======================================================
      // CART
      // =======================================================

      {
        path: 'cart',
        component: CartComponent,
      },

      // =======================================================
      // ADDRESSES
      // =======================================================

      {
        path: 'addresses',
        component: AddressList,
      },

      {
        path: 'addresses/new',
        component: AddressForm,
      },

      {
        path: 'addresses/edit/:id',
        component: AddressForm,
      },

      // =======================================================
      // CHECKOUT
      // =======================================================

      {
        path: 'checkout',
        component: CheckoutComponent,
      },
      // =======================================================
      // CONTACT US
      // =======================================================

      {
        path: 'contact',
        component: ContactEnquiryForm,
      },
      // =======================================================
      // ORDERS
      // =======================================================

      {
        path: 'orders',
        component: OrderList,
      },

      {
        path: 'orders/:id',
        component: OrderDetailComponent,
      },
      // =======================================================
      // RETURNS & REFUNDS
      // =======================================================

      {
        path: 'returns',
        component: ReturnList,
      },
      {
        path: 'returns/:id',
        component: ReturnDetail,
      },
    ],
  },

  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // =========================================================
  // FALLBACK
  // =========================================================

  {
    path: '**',
    redirectTo: 'login',
  },
];
