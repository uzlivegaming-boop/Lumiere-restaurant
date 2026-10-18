
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        LUMIERE<span>.</span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Bosh sahifa</Link>
        <Link to="/menu">Menyu</Link>
        <Link to="/about">Biz haqimizda</Link>
        <Link to="/contact">Aloqa</Link>
      </nav>

      <Link to="/booking" className="nav-button">
        Stol band qilish
      </Link>
    </header>
  );
}

export default Navbar;
