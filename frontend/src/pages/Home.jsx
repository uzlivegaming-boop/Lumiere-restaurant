import { Link } from 'react-router-dom';
function Home() {
  return (
    <section className="hero" id="home">
      <p className="eyebrow">LUMIERE RESTAURANT</p>

      <h1>
        Har bir ta’mda
        <br />
        <span>alohida san’at.</span>
      </h1>

      <p className="description">
        Mazali taomlar va unutilmas taassurotlar maskani.
      </p>

      <Link to="/menu" className="main-button">
        Menyuni ko‘rish
      </Link>
    </section>
  );
}

export default Home;