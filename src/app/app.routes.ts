import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

import { Home } from './features/home/home';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

// =========================================================
// CUSTOMER PRODUCT
// =========================================================

import { ProductList } from './features/products/product-list/product-list';

// =========================================================
// CART
// =========================================================

import { CartComponent } from './features/cart/cart/cart';

// =========================================================
// ADMIN DASHBOARD
// =========================================================

import { Dashboard } from './features/dashboard/dashboard/dashboard';

// =========================================================
// ADDRESS
// =========================================================

import { AddressList } from './features/address/address-list/address-list';
import { AddressForm } from './features/address/address-form/address-form';

// =========================================================
// CHECKOUT
// =========================================================

import { CheckoutComponent } from './features/checkout/checkout/checkout';

// =========================================================
// CUSTOMER ORDERS
// =========================================================

import { OrderDetailComponent } from './features/orders/order-detail/order-detail';
import { OrderList } from './features/orders/order-list/order-list';

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
import { Wishlist } from './features/wishlist/wishlist';
import { ProductDetail as CustomerProductDetail } from './features/products/product-detail/product-detail';

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

  // Admin Product List
  {
    path: 'admin/products',
    component: AdminProductList,
    canActivate: [adminGuard],
  },

  // Add Product
  // IMPORTANT: "new" must come before ":id"
  {
    path: 'admin/products/new',
    component: ProductForm,
    canActivate: [adminGuard],
  },

  // Edit Product
  {
    path: 'admin/products/:id/edit',
    component: ProductEdit,
    canActivate: [adminGuard],
  },

  // Product Details
  {
    path: 'admin/products/:id',
    component: ProductDetail,
    canActivate: [adminGuard],
  },

  // =========================================================
  // HOME
  // =========================================================

  {
    path: 'home',
    component: Home,
    canActivate: [authGuard],
  },

  // =========================================================
  // CUSTOMER PRODUCTS
  // =========================================================

  {
    path: 'products',
    component: ProductList,
    canActivate: [authGuard],
  },
  {
    path: 'products/:id',
    component: CustomerProductDetail,
    canActivate: [authGuard],
  },
  // =========================================================
  // WISHLIST
  // =========================================================

  {
    path: 'wishlist',
    component: Wishlist,
    canActivate: [authGuard],
  },

  // =========================================================
  // CART
  // =========================================================

  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard],
  },

  // =========================================================
  // ADDRESSES
  // =========================================================

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

  // =========================================================
  // CHECKOUT
  // =========================================================

  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard],
  },

  // =========================================================
  // CUSTOMER ORDERS
  // =========================================================

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
