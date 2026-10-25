import { useState } from 'react';
import client from '../api/client';

function Booking() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);

    try {

      const response = await client.post('/api/bookings', {
        name: form.name,
        phone: form.phone,
        date: form.date,
        time: form.time,
        guests: Number(form.guests),
        note: form.note,
      });


      setMessage(
        response.data?.message ||
        'Stol band qilish so‘rovi qabul qilindi.',
      );

      setForm({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        note: '',
      });
    } catch (err) {
      setError(true);
      setMessage(
        err.response?.data?.message ||
        'Xatolik yuz berdi. Qaytadan urinib ko‘ring.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <p className="eyebrow">LUMIERE RESTAURANT</p>
        <h1>
          Siz uchun
          <br />
          <span>maxsus joy.</span>
        </h1>
        <p>
          Yaqinlaringiz bilan unutilmas lahzalar uchun
          stolingizni oldindan band qiling.
        </p>
        <div className="booking-ornament">✳ ───── ✳</div>
      </section>

      <section className="booking-layout">
        <div className="booking-intro">
          <p className="eyebrow">OLDINDAN BAND QILING</p>
          <h2>Go‘zal lahzalar bir dasturxondan boshlanadi.</h2>
          <p>
            Quyidagi formani to‘ldiring. Ma’lumotlaringizni
            yuborganingizdan so‘ng band qilish so‘rovingiz
            restoranga jo‘natiladi.
          </p>

          <div className="booking-info">
            <span className="booking-info-icon">◇</span>
            <div>
              <h3>Shinam muhit</h3>
              <p>Siz va mehmonlaringiz uchun yoqimli atmosfera.</p>
            </div>
          </div>

          <div className="booking-info">
            <span className="booking-info-icon">✳</span>
            <div>
              <h3>Shaxsiy e’tibor</h3>
              <p>Har bir mehmon va har bir lahza biz uchun muhim.</p>
            </div>
          </div>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="booking-form-heading">
            <p className="eyebrow">LUMIERE · RESERVATION</p>
            <h2>Stol band qilish</h2>
            <p>Ma’lumotlaringizni kiriting</p>
          </div>

          <div className="booking-fields">
            <label>
              Ism va familiya
              <input
                type="text"
                name="name"
                placeholder="Ismingizni kiriting"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
              />
            </label>

            <label>
              Telefon raqami
              <input
                type="tel"
                name="phone"
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={handleChange}
                required
                minLength={7}
                maxLength={20}
              />
            </label>

            <div className="booking-fields-row">
              <label>
                Sana
                <input
                  type="date"
                  name="date"
                  min={minDate}
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Vaqt
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Tanlang</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                </select>
              </label>
            </div>

            <label>
              Mehmonlar soni
              <select
                name="guests"
                value={form.guests}
                onChange={handleChange}
                required
              >
                <option value="1">1 kishi</option>
                <option value="2">2 kishi</option>
                <option value="3">3 kishi</option>
                <option value="4">4 kishi</option>
                <option value="5">5 kishi</option>
                <option value="6">6 kishi</option>
                <option value="7">7 kishi</option>
                <option value="8">8 kishi</option>
              </select>
            </label>

            <label>
              Qo‘shimcha izoh <span>(ixtiyoriy)</span>
              <textarea
                name="note"
                placeholder="Maxsus istaklaringiz bo‘lsa, yozing..."
                value={form.note}
                onChange={handleChange}
                maxLength={500}
                rows={4}
              />
            </label>
          </div>

          {message && (
            <p
              className={`booking-message ${error ? 'booking-error' : 'booking-success'}`}
              role="status"
            >
              {message}
            </p>
          )}

          <button
            className="booking-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Yuborilmoqda...' : 'Stolni band qilish'}
            {!loading && <span>↗</span>}
          </button>

          <p className="booking-form-note">
            So‘rov yuborish stol band qilingani tasdiqlandi degani emas.
          </p>
        </form>
      </section>
    </main>
  );
}

export default Booking;