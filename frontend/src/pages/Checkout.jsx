
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../api/orders';

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Savatchangiz bo‘sh!');
      return;
    }

    setLoading(true);

    try {
      const result = await createOrder({
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
        items: cart.map((item) => ({
          dishId: item.id,
          quantity: item.quantity,
        })),
      });

      if (!result.success) {
        throw new Error(result.message || 'Buyurtma yaratilmadi.');
      }

      setOrder(result.data);
      clearCart();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Buyurtma yuborilmadi. Backend ishlayotganini tekshiring.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="checkout-page">
      <p className="eyebrow">LUMIERE RESTAURANT</p>
      <h1>Buyurtmani rasmiylashtirish</h1>

      {order ? (
        <div className="order-success">
          <h2>Buyurtmangiz qabul qilindi!</h2>
          <p>Buyurtma raqami: #{order.id}</p>
          <p>Tez orada siz bilan bog‘lanamiz.</p>

          {order.telegramLink ? (
            <div className="telegram-connect">
              <h3>Telegram bildirishnomalari</h3>
              <p>
                Buyurtmangiz tasdiqlanganda yoki holati o‘zgarganda
                xabar olish uchun Telegram akkauntingizni ulang.
              </p>

              <a
                href={order.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cart-menu-button"
              >
                Telegram’ga ulanish
              </a>

              <p>
                Havolani ochib, bot ichida <strong>Start</strong> tugmasini bosing.
              </p>
            </div>
          ) : (
            <p>
              Telegram havolasi hozircha mavjud emas. Buyurtmangiz qabul qilindi.
            </p>
          )}

          <Link to="/" className="cart-menu-button">
            Bosh sahifaga qaytish
          </Link>
        </div>
      ) : cart.length === 0 ? (
        <div>
          <p>Savatchangiz bo‘sh.</p>
          <Link to="/menu">Menyuga qaytish</Link>
        </div>
      ) : (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Ismingiz</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ismingizni kiriting"
            required
          />

          <label htmlFor="phone">Telefon raqamingiz</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+998 93 985 40 43"
            required
          />

          <label htmlFor="address">Yetkazib berish manzili</label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Manzilingizni kiriting"
            required
          />

          <label htmlFor="note">Qo‘shimcha izoh</label>
          <textarea
            id="note"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Masalan, mo‘ljal yoki boshqa izoh"
          />

          <div className="checkout-total">
            Jami: {totalPrice.toLocaleString('uz-UZ')} so‘m
          </div>

          {error && (
            <p role="alert" className="checkout-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Buyurtma yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
          </button>
        </form>
      )}
    </section>
  );
}

export default Checkout;
