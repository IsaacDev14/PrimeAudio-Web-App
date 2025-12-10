import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import ChatWidget from './components/ChatWidget';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Home from './pages/Home';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="bg-dark-bg min-h-screen text-white font-sans selection:bg-prime-red selection:text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track-order" element={<OrderTracking />} />
              <Route path="/login" element={<div className="p-20 text-center">Login Coming Soon</div>} />
            </Routes>
          </main>
          <ChatWidget />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
