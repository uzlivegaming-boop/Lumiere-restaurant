
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDishById } from '../api/dishes';

function DishDetails() {
  const { id } = useParams();

  const {
    data: dish,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dish', id],
    queryFn: () => getDishById(id),
    enabled: Boolean(id),
    retry: 1,
  });

  if (isLoading) {
    return (
      <section className="about-section">
        <p>Taom ma’lumotlari yuklanmoqda...</p>
      </section>
    );
  }

  if (isError || !dish) {
    return (
      <section className="about-section">
        <h2>Taom topilmadi</h2>
        <Link to="/menu" className="main-button">
          Menyuga qaytish
        </Link>
      </section>
    );
  }

  const ingredients = Array.isArray(dish.ingredients)
    ? dish.ingredients
    : [];

  const steps = Array.isArray(dish.steps)
    ? dish.steps
    : [];

  const ratings = Array.isArray(dish.ratings)
    ? dish.ratings
    : [];

  const rating =
    ratings.length > 0
      ? ratings.reduce(
          (sum, item) => sum + Number(item.score || 0),
          0
        ) / ratings.length
      : 0;

  return (
    <section className="dish-details">
      <Link to="/menu" className="back-link">
        ← Menyuga qaytish
      </Link>

      <div className="details-layout">
        {dish.image && (
          <img
            className="details-image"
            src={dish.image}
            alt={dish.name}
          />
        )}

        <div className="details-content">
          <span className="dish-category">
            {dish.category?.name || 'Taom'}
          </span>

          <h1>{dish.name}</h1>

          <div className="details-rating">
            ★ {rating.toFixed(1)}/5
            <small> ({ratings.length} ta baho)</small>
          </div>

          <p className="details-description">
            {dish.description}
          </p>

          <h2>
            {Number(dish.price).toLocaleString('uz-UZ')} so‘m
          </h2>

          <div className="recipe-section">
            <h3>Masalliqlar</h3>

            {ingredients.length > 0 ? (
              <ul>
                {ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p>Masalliqlar kiritilmagan.</p>
            )}
          </div>

          <div className="recipe-section">
            <h3>Tayyorlash</h3>

            {steps.length > 0 ? (
              <ol>
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>Tayyorlash bosqichlari kiritilmagan.</p>
            )}
          </div>

          <Link to="/menu" className="main-button">
            Menyuga qaytish
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DishDetails;
