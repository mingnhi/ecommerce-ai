import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "@/features/dashboard/pages/Dashboard";
import ProductPage from "@/features/product/pages/ProductPage";
import { CartPage } from "@/features/cart/pages/CartPage";
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
    ],
  },
];

export const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);