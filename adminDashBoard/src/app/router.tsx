import { createBrowserRouter, Navigate } from "react-router-dom";

import DashboardPage from "@/features/dashboard/pages/Dashboard";

import CategoriesPage from "@/features/categories/pages/categories-page";

// Products
import ProductsPage from "@/features/products/pages/products-page";
import ProductDetailPage from "@/features/products/pages/product-detail-page";
import CreateProductPage from "@/features/products/pages/create-product-page";
import EditProductPage from "@/features/products/pages/edit-product-page";

import { CartPage } from "@/features/cart/pages/CartPage";
import OrdersPage from "@/features/order/pages/OrdersPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import InventoryHistoryPage from "@/features/inventory/pages/InventoryHistoryPage";
import RolesPage from "@/features/roles/pages/RolesPage";
import PermissionsPage from "@/features/permissions/pages/PermissionsPage";
import UsersPage from "@/features/users/pages/UsersPage";
import ProfilePage from "@/features/account/pages/ProfilePage";
import ChangePasswordPage from "@/features/account/pages/ChangePasswordPage";
import NotFoundPage from "@/features/system/pages/NotFoundPage";
import ForbiddenPage from "@/features/system/pages/ForbiddenPage";
import MainLayout from "@/shared/layouts/MainLayout";
import { PERMISSIONS } from "@/shared/lib/casl/permissions";
import {
  LoginPage,
  PermissionRoute,
  PrivateRoute,
  PublicLoginRoute,
} from "./route-components";

export const publicRoutes = [
  {
    path: "/login",
    element: (
      <PublicLoginRoute>
        <LoginPage />
      </PublicLoginRoute>
    ),
  },
];

export const privateRoutes = [
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      {
        path: "/dashboard",
        element: (
          <PermissionRoute permission={PERMISSIONS.DASHBOARD.READ}>
            <DashboardPage />
          </PermissionRoute>
        ),
      },

      {
        path: "/categories",
        element: <CategoriesPage />,
      },

      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/products/create",
        element: <CreateProductPage />,
      },
      {
        path: "/products/:slug/edit",     // ← Sửa thành slug cho đồng bộ
        element: <EditProductPage />,
      },
      {
        path: "/products/:slug",          // Detail
        element: <ProductDetailPage />,
      },

      {
        path: "/cart",
        element: <CartPage />,
      },
      { path: "/cart", element: <CartPage /> },
      {
        path: "/orders",
        element: (
          <PermissionRoute permission={PERMISSIONS.ORDER.READ}>
            <OrdersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory",
        element: (
          <PermissionRoute permission={PERMISSIONS.INVENTORY.READ}>
            <InventoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/history",
        element: (
          <PermissionRoute permission={PERMISSIONS.INVENTORY.READ}>
            <InventoryHistoryPage />
          </PermissionRoute>
        ),
      },

      // Catch all
      {
        path: "/roles",
        element: (
          <PermissionRoute permission={PERMISSIONS.ROLE.READ}>
            <RolesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/permissions",
        element: (
          <PermissionRoute permission={PERMISSIONS.PERMISSION.READ}>
            <PermissionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/users",
        element: (
          <PermissionRoute permission={PERMISSIONS.USER.READ}>
            <UsersPage />
          </PermissionRoute>
        ),
      },
      { path: "/account/profile", element: <ProfilePage /> },
      { path: "/account/password", element: <ChangePasswordPage /> },
      { path: "/403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
]);

