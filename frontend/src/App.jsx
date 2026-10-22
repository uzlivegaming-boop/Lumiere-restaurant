
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Booking from './pages/Booking';
import DishDetails from './pages/DishDetails';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';

import { CartProvider } from './contexts/CartContext';
import './index.css';

function WebsiteLayout() {
  return (
    <div className="website">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <footer>
        <p>LUMIERE. — Unutilmas ta’m shu yerdan boshlanadi.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />

          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:id" element={<DishDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
