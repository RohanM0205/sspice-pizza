import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileCartBar from "@/components/MobileCartBar";

/* Public Pages */
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import TrackOrderPage from "./pages/TrackOrderPage";

/* Admin Pages */
import DashboardPage from "./admin/DashboardPage";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import OrdersPage from "./admin/OrdersPage";
import ProductsPage from "./admin/ProductsPage";
import CategoriesPage from "./admin/CategoriesPage";
import AnalyticsPage from "./admin/AnalyticsPage";
import DeliveryPanel from "./admin/DeliveryPanel";
import AdminCouponsPage from "./admin/AdminCouponsPage";
import ManageAdminsPage from "./admin/ManageAdminsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CartDrawer />
            <WhatsAppButton />
            <MobileCartBar />

            <Routes>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />

              {/* ADMIN DASHBOARD */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN ORDERS */}
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AdminOrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* LEGACY ORDERS PAGE (if needed) */}
              <Route
                path="/admin/orders-list"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* PRODUCTS */}
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <ProductsPage />
                  </ProtectedRoute>
                }
              />

              {/* CATEGORIES */}
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <CategoriesPage />
                  </ProtectedRoute>
                }
              />

              {/* ANALYTICS */}
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* DELIVERY PANEL */}
              <Route
                path="/admin/delivery"
                element={
                  <ProtectedRoute allowedRoles={["delivery", "admin", "superadmin"]}>
                    <DeliveryPanel />
                  </ProtectedRoute>
                }
              />

              {/* COUPONS */}
              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AdminCouponsPage />
                  </ProtectedRoute>
                }
              />

              {/* SUPERADMIN ONLY */}
              <Route
                path="/admin/manage-admins"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <ManageAdminsPage />
                  </ProtectedRoute>
                }
              />

              {/* FALLBACK */}
              <Route path="*" element={<NotFound />} />

            </Routes>

          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;