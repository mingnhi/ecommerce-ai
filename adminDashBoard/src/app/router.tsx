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
import NotFoundPage from "@/features/system/pages/NotFoundPage";

import MainLayout from "@/shared/layouts/MainLayout";

import {
  LoginPage,
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
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },

      {
        path: "/dashboard",
        element: <DashboardPage />,
      },

      // ==================== CATEGORIES ====================
      {
        path: "/categories",
        element: <CategoriesPage />,
      },

      // ==================== PRODUCTS ====================
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

      // ==================== OTHER FEATURES ====================
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
      {
        path: "/inventory",
        element: <InventoryPage />,
      },
      {
        path: "/inventory/history",
        element: <InventoryHistoryPage />,
      },

      // Catch all
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
]);