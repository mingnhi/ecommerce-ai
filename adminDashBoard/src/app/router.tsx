import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "@/features/dashboard/pages/Dashboard";
import ProductPage from "@/features/product/pages/ProductPage";
import { CartPage } from "@/features/cart/pages/CartPage";
import OrdersPage from "@/features/order/pages/OrdersPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import InventoryHistoryPage from "@/features/inventory/pages/InventoryHistoryPage";
import NotFoundPage from "@/features/system/pages/NotFoundPage";
import MainLayout from "@/shared/layouts/MainLayout";
import { LoginPage, PrivateRoute, PublicLoginRoute } from "./route-components";

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
      {
        path: "/products/:id",
        element: <ProductPage />,
      },
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
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);