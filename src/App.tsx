import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Market from "./pages/Market";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import NotFound from "./pages/NotFound";
import BioScan from "./pages/BioScan";
import Layout from "./components/ui/Layout";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/market" element={<Market />} />
              <Route path="/market/:id" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/bioscan" element={<BioScan />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
