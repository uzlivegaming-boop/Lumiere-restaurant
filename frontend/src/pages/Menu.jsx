import { useState } from 'react';
import { Link } from 'react-router-dom';

const dishes = [
  {
    id: 1,
    name: 'Italiya pitsasi',
    category: 'Asosiy taom',
    price: 89000,
    rating: 4.9,
    reviews: 124,
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80',
    description: 'Pishloq, pomidor va maxsus ziravorlar.',
  },
  {
    id: 2,
    name: 'Maxsus salat',
    category: 'Salat',
    price: 65000,
    rating: 4.8,
    reviews: 86,
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80',
    description: 'Yangi sabzavotlar va mazali sous.',
  },
  {
    id: 3,
    name: 'Gril go‘sht',
    category: 'Asosiy taom',
    price: 125000,
    rating: 4.9,
    reviews: 97,
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
    description: 'Grilda pishirilgan go‘sht va ko‘katlar.',
  },
  {
    id: 4,
    name: 'Shokoladli desert',
    category: 'Desert',
    price: 45000,
    rating: 4.7,
    reviews: 65,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
    description: 'Shirin va mayin shokoladli tort.',
  },
  {
    id: 5,
    name: 'Burger',
    category: 'Asosiy taom',
    price: 75000,
    rating: 4.8,
    reviews: 112,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
    description: 'Mol go‘shti, pishloq va yangi sabzavotlar.',
  },
  {
    id: 6,
    name: 'Mevali ichimlik',
    category: 'Ichimlik',
    price: 25000,
    rating: 4.6,
    reviews: 43,
    image:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=80',
    description: 'Mevalardan tayyorlangan salqin ichimlik.',
  },
];

const categories = [
  'Barchasi',
  'Asosiy taom',
  'Salat',
  'Desert',
  'Ichimlik',
];

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');

  const filteredDishes =
    selectedCategory === 'Barchasi'
      ? dishes
      : dishes.filter((dish) => dish.category === selectedCategory);

  return (
    <section className="menu-page">
      <div className="menu-heading">
        <p className="eyebrow">LUMIERE RESTAURANT</p>
        <h1>Bizning menyu</h1>
        <p>Har bir ta’mda o‘ziga xos san’at.</p>
      </div>

      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={
              selectedCategory === category ? 'category-button active' : 'category-button'
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="dish-grid">
        {filteredDishes.map((dish) => (
          <article className="dish-card" key={dish.id}>
            <img src={dish.image} alt={dish.name} />

            <div className="dish-info">
              <span className="dish-category">{dish.category}</span>
              <h2>{dish.name}</h2>

              <div className="dish-rating">
                <span>★</span> {dish.rating}/5
                <small>({dish.reviews} ta baho)</small>
              </div>

              <p>{dish.description}</p>

              <div className="dish-bottom">
                <strong>{dish.price.toLocaleString('uz-UZ')} so‘m</strong>

                <Link to={`/menu/${dish.id}`} className="details-button">
                  Batafsil
                </Link>
              </div>

              <button
                className="order-button"
                type="button"
                onClick={() => alert(`${dish.name} tanlandi. Savatcha keyingi bosqichda ulanadi.`)}
              >
                Buyurtma qilish
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Menu;
