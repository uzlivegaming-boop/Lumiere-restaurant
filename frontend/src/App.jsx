
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Booking from './pages/Booking';
import DishDetails from './pages/DishDetails';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="website">
        <Navbar />

        <main>
          <Routes>
            <Route path="/menu/:id" element={<DishDetails />} />
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/booking" element={<Booking />} />
          </Routes>
        </main>

        <footer>
          <p>LUMIERE. — Unutilmas ta’m shu yerdan boshlanadi.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
