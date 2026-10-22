
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
  } = useCart();

  return (
    <section className="cart-page">
      <div className="cart-heading">
        <p className="eyebrow">LUMIERE RESTAURANT</p>
        <h1>Savatcha </h1>
        <p>Tanlagan taomlaringiz shu yerda.</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>Savatchangiz hozircha bo‘sh</h2>
          <p>Menyudan o‘zingizga yoqqan taomni tanlang.</p>
          <Link to="/menu" className="cart-menu-button">
            Menyuga o‘tish
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <h2>{item.name}</h2>
                  <p>
                    {item.price.toLocaleString('uz-UZ')} so‘m
                  </p>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-end">
                  <strong>
                    {(item.price * item.quantity).toLocaleString('uz-UZ')} so‘m
                  </strong>

                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    O‘chirish
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <button
              className="clear-cart-button"
              type="button"
              onClick={clearCart}
            >
              Savatchani tozalash
            </button>

            <div className="cart-total">
              <span>Umumiy summa:</span>
              <strong>{totalPrice.toLocaleString('uz-UZ')} so‘m</strong>
            </div>

            <Link to="/checkout" className="checkout-button">
              Buyurtmani rasmiylashtirish
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;
