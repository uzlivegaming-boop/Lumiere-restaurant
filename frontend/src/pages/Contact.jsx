import { useState } from 'react';
import client from '../api/client';

function Contact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    username: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await client.post('/api/contact', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
        message: form.message.trim(),
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Murojaat yuborilmadi.'
        );
      }

      setSuccess('Murojaatingiz muvaffaqiyatli yuborildi!');

      setForm({
        name: '',
        phone: '',
        username: '',
        message: '',
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="contact-page">
      <header className="contact-hero">
        <span className="eyebrow">LUMIERE RESTAURANT</span>

        <h1>Biz bilan bog‘laning</h1>

        <p>
          Savolingiz, taklifingiz yoki buyurtmangiz bormi?
          Biz sizni tinglashga tayyormiz.
        </p>
      </header>

      <section className="contact-layout">
        <div className="contact-information">
          <span className="eyebrow">ALOQA MA’LUMOTLARI</span>

          <h2>Sizni kutamiz</h2>

          <article className="contact-info-item">
            <span className="contact-icon">⌖</span>
            <div>
              <h3>Manzil</h3>
              <p>Farg‘ona viloyati, O‘zbekiston</p>
            </div>
          </article>

          <article className="contact-info-item">
            <span className="contact-icon">☎</span>
            <div>
              <h3>Telefon</h3>
              <a href="tel:+998939854043">
                +998 93 985 40 43
              </a>
            </div>
          </article>

          <article className="contact-info-item">
            <span className="contact-icon">◷</span>
            <div>
              <h3>Ish vaqti</h3>
              <p>Har kuni: 08:00 – 23:00</p>
            </div>
          </article>

          <article className="contact-info-item">
            <span className="contact-icon">✉</span>
            <div>
              <h3>Telegram</h3>
              <a
                href="https://t.me/Stranger_Vibe"
                target="_blank"
                rel="noreferrer"
              >
                @Stranger_Vibe
              </a>
            </div>
          </article>

          <a
            className="contact-telegram-link"
            href="https://t.me/Stranger_Vibe"
            target="_blank"
            rel="noreferrer"
          >
            Telegram profilimga o‘tish ↗
          </a>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <span className="eyebrow">BIZGA YOZING</span>

          <h2>Xabar yuborish</h2>

          <label htmlFor="contact-name">Ismingiz</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ismingizni kiriting"
            minLength={2}
            maxLength={100}
            required
          />

          <label htmlFor="contact-phone">
            Telefon raqamingiz
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+998 90 123 45 67"
            maxLength={30}
            required
          />

          <label htmlFor="contact-username">
            Telegram username
          </label>
          <input
            id="contact-username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="@username"
            maxLength={33}
            required
          />

          <label htmlFor="contact-message">Xabaringiz</label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Xabaringizni yozing..."
            rows={5}
            minLength={5}
            maxLength={2000}
            required
          />

          <button
            type="submit"
            className="contact-submit"
            disabled={loading}
          >
            {loading
              ? 'Yuborilmoqda...'
              : 'Xabar yuborish ↗'}
          </button>

          {success && (
            <p className="contact-success" role="status">
              {success}
            </p>
          )}

          {error && (
            <p className="contact-error" role="alert">
              {error}
            </p>
          )}

          <p className="contact-form-note">
            Ma’lumotlaringiz restoran bilan bog‘lanish uchun
            ishlatiladi. Telegram username’ingizni to‘g‘ri kiriting.
          </p>
        </form>
      </section>
    </main>
  );
}

export default Contact;