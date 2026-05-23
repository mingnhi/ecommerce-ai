import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "@/features/dashboard/pages/Dashboard";
import ProductPage from "@/features/product/pages/ProductPage";
import { CartPage } from "@/features/cart/pages/CartPage";
import OrdersPage from "@/features/order/pages/OrdersPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import InventoryHistoryPage from "@/features/inventory/pages/InventoryHistoryPage";
import RolesPage from "@/features/roles/pages/RolesPage";
import PermissionsPage from "@/features/permissions/pages/PermissionsPage";
import UsersPage from "@/features/users/pages/UsersPage";
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
        path: "/products/:id",
        element: (
          <PermissionRoute permission={PERMISSIONS.PRODUCT.READ}>
            <ProductPage />
          </PermissionRoute>
        ),
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
      { path: "/403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);
