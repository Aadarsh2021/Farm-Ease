import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Home from '@/pages/Home';

// Root App Component
export default function App() {
  return (
    <Router>
      <div className="antialiased bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-green-100 selection:text-green-900">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                {/* Fallback or other routes can be added here */}
              </Routes>
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}
