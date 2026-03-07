import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import ProductsPage from "./admin/ProductsPage";
import CategoriesPage from "./admin/CategoriesPage";
import AnalyticsPage from "./admin/AnalyticsPage";
import DeliveryPanel from "./admin/DeliveryPanel";
import AdminCouponsPage from "./admin/AdminCouponsPage";
import ManageAdminsPage from "./admin/ManageAdminsPage";

/* Orders System */
import PendingOrdersPage from "./admin/Orders/PendingOrdersPage";
import AcceptedOrdersPage from "./admin/Orders/AcceptedOrdersPage";
import RejectedOrdersPage from "./admin/Orders/RejectedOrdersPage";
import DeliveryDashboard from "./admin/Delivery/DeliveryDashboard";

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

              {/* ORDERS SYSTEM */}

              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <Navigate to="/admin/orders/pending" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/orders/pending"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <PendingOrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/orders/accepted"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AcceptedOrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/orders/rejected"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <RejectedOrdersPage />
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
      <DeliveryDashboard />
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