import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';

import { Register } from './features/auth/register/register';

import { Home } from './features/home/home';

import { authGuard } from './core/guards/auth-guard';

import { adminGuard } from './core/guards/admin-guard';

import { ProductList } from './features/products/product-list/product-list';

import { CartComponent } from './features/cart/cart/cart';

import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { AddressList } from './features/address/address-list/address-list';

import { AddressForm } from './features/address/address-form/address-form';

import { CheckoutComponent } from './features/checkout/checkout/checkout';

import { OrderDetailComponent } from './features/orders/order-detail/order-detail';

import { OrderList } from './features/orders/order-list/order-list';

import { AdminOrderListComponent } from './features/orders/admin-order-list/admin-order-list';

import { AdminOrderDetailComponent } from './features/orders/admin-order-detail/admin-order-detail';

import { UserList } from './features/admin-users/user-list/user-list';
import { UserDetail } from './features/admin-users/user-detail/user-detail';
import { UserEdit } from './features/admin-users/user-edit/user-edit';
import { CategoryList } from './features/categories/category-list/category-list';
import { CategoryDetail } from './features/categories/category-detail/category-detail';
import { CategoryForm } from './features/categories/category-form/category-form';

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
  // HOME
  // =========================================================

  {
    path: 'home',
    component: Home,
    canActivate: [authGuard],
  },

  // =========================================================
  // PRODUCTS
  // =========================================================

  {
    path: 'products',
    component: ProductList,
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
