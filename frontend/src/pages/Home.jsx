import { Link } from 'react-router-dom';

const dishes = [
  {
    number: '01',
    name: 'An’anaviy palov',
    category: 'MILLIY TAOMLAR',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '02',
    name: 'Maxsus taomlar',
    category: 'OSHXONA SAN’ATI',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '03',
    name: 'Shirinliklar',
    category: 'SHIRIN LAHZALAR',
    image:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85',
  },
];

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="eyebrow">LUMIERE RESTAURANT · TOSHKENT</p>

          <h1>
            Har bir ta’mda
            <br />
            <span>alohida san’at.</span>
          </h1>

          <p className="hero-description">
            Nafis muhit, o‘ziga xos ta’mlar va unutilmas
            taassurotlar — barchasi bir manzilda.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="main-button">
              Menyuni ko‘rish <span>↗</span>
            </Link>

            <Link to="/booking" className="hero-secondary-button">
              Stol band qilish
            </Link>
          </div>

          <div className="hero-note">
            <span className="hero-note-line" />
            <span>TA’MDA NAZOKAT. MUHITDA HASHAMAT.</span>
          </div>
        </div>

        <div className="hero-side-text">AN EXPERIENCE TO REMEMBER</div>
        <div className="hero-index">01 — 03</div>
      </section>

      <section className="home-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">✳</span>
          <div>
            <h3>Sifatli masalliqlar</h3>
            <p>Har bir taomga alohida e’tibor</p>
          </div>
        </div>

        <div className="benefit-item">
          <span className="benefit-icon">♨</span>
          <div>
            <h3>Yangi tayyorlanadi</h3>
            <p>Buyurtmangizga mos ravishda</p>
          </div>
        </div>

        <div className="benefit-item">
          <span className="benefit-icon">◇</span>
          <div>
            <h3>Nafis muhit</h3>
            <p>Yoqimli lahzalar uchun</p>
          </div>
        </div>

        <div className="benefit-item">
          <span className="benefit-icon">♡</span>
          <div>
            <h3>Mehr bilan xizmat</h3>
            <p>Har bir mehmon biz uchun muhim</p>
          </div>
        </div>
      </section>

      <section className="home-dishes">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BIZNING TANLOVIMIZ</p>
            <h2>Ta’m bilan tanishing.</h2>
            <p className="section-description">
              Har bir taom — did, mahorat va sifat uyg‘unligi.
            </p>
          </div>

          <Link to="/menu" className="text-link">
            To‘liq menyu <span>↗</span>
          </Link>
        </div>

        <div className="home-dish-grid">
          {dishes.map((dish) => (
            <Link
              to="/menu"
              className="home-dish-card"
              key={dish.number}
            >
              <div className="home-dish-image">
                <img src={dish.image} alt={dish.name} loading="lazy" />
                <span className="dish-number">{dish.number}</span>
                <span className="dish-arrow">↗</span>
              </div>

              <div className="home-dish-info">
                <p>{dish.category}</p>
                <h3>{dish.name}</h3>
                <span className="dish-discover">
                  MENYUDAN TANLASH ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-about">
        <div className="about-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1100&q=85"
            alt="Nafis restoran muhiti"
            loading="lazy"
          />
          <div className="about-image-caption">
            <span>L</span>
            <p>NAZOKAT HAR BIR DETALDA</p>
          </div>
        </div>

        <div className="home-about-content">
          <p className="eyebrow">LUMIERE FALSAFASI</p>
          <h2>
            Oddiy kechki ovqat emas.
            <br />
            <span>Maxsus taassurot.</span>
          </h2>

          <p>
            Biz uchun restoran — bu faqat taom emas. Bu yaqinlar
            bilan o‘tkazilgan vaqt, samimiy suhbat va uzoq vaqt
            yodda qoladigan lahzalardir.
          </p>

          <p>
            Har bir detalda nafislik, har bir xizmatda e’tibor
            va har bir ta’mda o‘ziga xoslikni qadrlaymiz.
          </p>

          <Link to="/about" className="outline-button">
            Biz haqimizda <span>↗</span>
          </Link>

          <div className="about-signature">Lumiere.</div>
        </div>
      </section>

      <section className="home-quote">
        <span className="quote-mark">“</span>
        <p>
          Eng go‘zal xotiralar ko‘pincha
          <br />
          bir dasturxon atrofida yaratiladi.
        </p>
        <span className="quote-line" />
        <span className="eyebrow">LUMIERE — UNUTILMAS TA’M</span>
      </section>

      <section className="home-booking">
        <div>
          <p className="eyebrow">SIZNI KUTAMIZ</p>
          <h2>
            Keyingi go‘zal lahzangiz
            <br />
            <span>shu yerdan boshlansin.</span>
          </h2>
          <p>
            O‘zingizga va yaqinlaringizga vaqt ajrating.
            Stolni oldindan band qiling.
          </p>
        </div>

        <Link to="/booking" className="main-button">
          Stol band qilish <span>↗</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;