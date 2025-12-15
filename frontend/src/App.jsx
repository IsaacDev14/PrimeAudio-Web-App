import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { FlyingCartProvider } from './components/FlyingCart';
// import FloatingChatButton from './components/FloatingChatButton';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminContent from './pages/admin/Products';  // Content Manager (Projects, Services, etc.)
import AdminOrders from './pages/admin/Orders';
import AdminAITools from './pages/admin/AITools';
import AdminUsers from './pages/admin/Users';
import AdminMedia from './pages/admin/Media';
import AdminMessages from './pages/admin/Messages';
import AdminSettings from './pages/admin/Settings';
import AdminOffers from './pages/admin/AdminOffers';

// Customer Dashboard Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerOrders from './pages/customer/Orders';
import OrderDetails from './pages/customer/OrderDetails';
import CustomerMessages from './pages/customer/Messages';
import CustomerProfile from './pages/customer/Profile';
import CustomerAddresses from './pages/customer/Addresses';
import CustomerWishlist from './pages/customer/Wishlist';

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <FlyingCartProvider>
                <Router>
                  <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:id" element={<ProductDetails />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/track-order" element={<OrderTracking />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Customer Dashboard Routes */}
                    <Route path="/dashboard" element={<CustomerLayout />}>
                      <Route index element={<CustomerDashboard />} />
                      <Route path="orders" element={<CustomerOrders />} />
                      <Route path="orders/:id" element={<OrderDetails />} />
                      <Route path="messages" element={<CustomerMessages />} />
                      <Route path="messages/:id" element={<CustomerMessages />} />
                      <Route path="wishlist" element={<CustomerWishlist />} />
                      <Route path="addresses" element={<CustomerAddresses />} />
                      <Route path="profile" element={<CustomerProfile />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="content" element={<AdminContent />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="media" element={<AdminMedia />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="messages/:id" element={<AdminMessages />} />
                      <Route path="ai-tools" element={<AdminAITools />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="offers" element={<AdminOffers />} />
                    </Route>

                    {/* 404 Fallback */}
                    <Route path="*" element={<div className="p-20 text-center">404 - Page Not Found</div>} />
                  </Routes>

                  {/* Global Floating Chat Button - Removed to use ChatWidget in PublicLayout */}
                </Router>
              </FlyingCartProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

