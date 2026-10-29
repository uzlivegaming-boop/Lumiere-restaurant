
function About() {
  return (
    <section className="about-section">
      <div className="about-hero">
        <p className="eyebrow">LUMIERE RESTAURANT</p>
        <h1>Biz haqimizda</h1>
        <p className="about-lead">
          Har bir taomda e’tibor, har bir tashrifda unutilmas taassurot.
        </p>
      </div>

      <div className="about-content">
        <div>
          <p className="eyebrow">BIZNING HIKOYA</p>
          <h2>Ta’m va nafislik uyg‘unligi</h2>
          <p>
            Lumiere — mazali taomlar, samimiy xizmat va yoqimli
            muhitni bir joyda jamlashga intiladigan restoran.
            Bizning maqsadimiz — mehmonlarimizga taomdan zavq
            olishlari uchun qulay va esda qolarli tajriba yaratish.
          </p>
        </div>

        <div>
          <p className="eyebrow">BIZNING YONDASHUV</p>
          <h2>Sifatga e’tibor</h2>
          <p>
            Menyudagi har bir taomning ta’mi, taqdimoti va
            tayyorlanishiga e’tibor beramiz. Buyurtma berish,
            stol band qilish va biz bilan bog‘lanish jarayonlarini
            ham imkon qadar sodda qilishni istaymiz.
          </p>
        </div>
      </div>

      <div className="about-values">
        <article>
          <span>01</span>
          <h3>Ta’m</h3>
          <p>Har bir luqmada mazali taassurot yaratishga intilamiz.</p>
        </article>

        <article>
          <span>02</span>
          <h3>Mehmondo‘stlik</h3>
          <p>Har bir mehmon o‘zini qulay his qilishi biz uchun muhim.</p>
        </article>

        <article>
          <span>03</span>
          <h3>E’tibor</h3>
          <p>Buyurtmadan xizmat ko‘rsatishgacha har bir tafsilot muhim.</p>
        </article>
      </div>
    </section>
  );
}

export default About;
