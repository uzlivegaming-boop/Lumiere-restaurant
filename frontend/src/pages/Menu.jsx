
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getDishes } from '../api/dishes';

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const { addToCart } = useCart();

  const {
    data: dishes = [],
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['dishes'],
    queryFn: getDishes,
    select: (data) => Array.isArray(data) ? data : [],
  });

  const categories = [
    'Barchasi',
    ...new Set(
      dishes
        .map((dish) => dish.category?.name)
        .filter(Boolean)
    ),
  ];

  const filteredDishes =
    selectedCategory === 'Barchasi'
      ? dishes
      : dishes.filter(
          (dish) => dish.category?.name === selectedCategory
        );

  return (
    <section className="menu-page">
      <div className="menu-heading">
        <p className="eyebrow">LUMIERE RESTAURANT</p>
        <h1>Bizning menyu</h1>
        <p>Har bir ta’mda o‘ziga xos san’at.</p>
      </div>

      {loading && <p>Taomlar yuklanmoqda...</p>}

      {isError && (
        <p role="alert">
          Taomlarni yuklab bo‘lmadi. Backend ishlayotganini tekshiring.
        </p>
      )}

      {!loading && !isError && (
        <>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? 'category-button active'
                    : 'category-button'
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredDishes.length === 0 ? (
            <p>Hozircha bu kategoriyada taomlar yo‘q.</p>
          ) : (
            <div className="dish-grid">
              {filteredDishes.map((dish) => {
                const price = Number(dish.price) || 0;

                const ratings = Array.isArray(dish.ratings)
                  ? dish.ratings
                  : [];

                const rating =
                  ratings.length > 0
                    ? ratings.reduce(
                        (sum, item) => sum + Number(item.value || 0),
                        0
                      ) / ratings.length
                    : 0;

                return (
                  <article className="dish-card" key={dish.id}>
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} />
                    ) : (
                      <div className="dish-image-placeholder">
                        LUMIERE
                      </div>
                    )}

                    <div className="dish-info">
                      <span className="dish-category">
                        {dish.category?.name || 'Taom'}
                      </span>

                      <h2>{dish.name}</h2>

                      <div className="dish-rating">
                        <span>★</span> {rating.toFixed(1)}/5
                        <small>({ratings.length} ta baho)</small>
                      </div>

                      <p>{dish.description}</p>

                      <div className="dish-bottom">
                        <strong>
                          {price.toLocaleString('uz-UZ')} so‘m
                        </strong>

                        <Link
                          to={`/menu/${dish.id}`}
                          className="details-button"
                        >
                          Batafsil
                        </Link>
                      </div>

                      <button
                        className="order-button"
                        type="button"
                        disabled={dish.isAvailable === false}
                        onClick={() => {
                          addToCart({ ...dish, price });
                          alert(`${dish.name} savatchaga qo‘shildi!`);
                        }}
                      >
                        {dish.isAvailable === false
                          ? 'Mavjud emas'
                          : 'Buyurtma qilish'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Menu;
