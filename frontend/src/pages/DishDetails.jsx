
import { Link, useParams } from 'react-router-dom';

const dishes = [
  {
    id: 1,
    name: 'Italiya pitsasi',
    category: 'Asosiy taom',
    price: 89000,
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80',
    description: 'Pishloq, pomidor va maxsus ziravorlar bilan tayyorlangan italyan pitsasi.',
    ingredients: [
      '300 g pitsa xamiri',
      '200 g mozzarella pishlog‘i',
      '150 g pomidor sousi',
      '150 g pomidor',
      '2 osh qoshiq zaytun yog‘i',
      '1 choy qoshiq oregano',
      'Ta’bga ko‘ra tuz',
    ],
    steps: [
      'Pechni 220°C gacha qizdiring.',
      'Xamirni yoyib, ustiga pomidor sousini surting.',
      'Mozzarella pishlog‘i va pomidor bo‘laklarini joylashtiring.',
      'Zaytun yog‘i va oregano seping.',
      'Pitsani pechda 12–15 daqiqa pishiring.',
      'Pishloq erib, xamir tillarang bo‘lgach, dasturxonga torting.',
    ],
    tip: 'Pitsani issiqligida torting. Yangi rayhon barglari unga o‘ziga xos hid beradi.',
  },
  {
    id: 2,
    name: 'Maxsus salat',
    category: 'Salat',
    price: 65000,
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    description: 'Yangi sabzavotlar, ko‘katlar va mazali sous bilan tayyorlangan salat.',
    ingredients: [
      '200 g salat barglari',
      '2 dona pomidor',
      '1 dona bodring',
      '1 dona bulg‘or qalampiri',
      '100 g feta pishlog‘i',
      '2 osh qoshiq zaytun yog‘i',
      '1 osh qoshiq limon sharbati',
      'Ta’bga ko‘ra tuz va murch',
    ],
    steps: [
      'Sabzavotlar va salat barglarini yaxshilab yuving.',
      'Pomidor, bodring va qalampirni to‘g‘rang.',
      'Barcha sabzavotlarni katta idishga soling.',
      'Zaytun yog‘i, limon sharbati, tuz va murchni aralashtiring.',
      'Sousni salat ustiga quying va ehtiyotkorlik bilan aralashtiring.',
      'Feta pishlog‘ini qo‘shib, dasturxonga torting.',
    ],
    tip: 'Salatni dasturxonga tortishdan oldin sous qo‘shing, shunda sabzavotlar yangi va qarsildoq qoladi.',
  },
  {
    id: 3,
    name: 'Gril go‘sht',
    category: 'Asosiy taom',
    price: 125000,
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    description: 'Ziravorlar bilan marinadlangan, grilda pishirilgan go‘sht.',
    ingredients: [
      '800 g mol yoki qo‘y go‘shti',
      '2 osh qoshiq o‘simlik yog‘i',
      '3 dona sarimsoq bo‘lagi',
      '1 choy qoshiq zira',
      '1 choy qoshiq paprika',
      'Ta’bga ko‘ra tuz va murch',
      'Yangi ko‘katlar',
    ],
    steps: [
      'Go‘shtni o‘rtacha kattalikdagi bo‘laklarga bo‘ling.',
      'Yog‘, maydalangan sarimsoq va ziravorlarni aralashtiring.',
      'Go‘shtni marinadga aralashtirib, muzlatkichda 1–2 soat saqlang.',
      'Grilni qizdiring va go‘shtni ustiga joylashtiring.',
      'Go‘shtning turi va qalinligiga mos ravishda pishiring.',
      'Go‘shtni bir necha daqiqa tindirib, ko‘katlar bilan torting.',
    ],
    tip: 'Go‘shtni pishirgandan so‘ng biroz tindiring. Shunda uning shirasi yaxshiroq saqlanadi.',
  },
  {
    id: 4,
    name: 'Shokoladli desert',
    category: 'Desert',
    price: 45000,
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    description: 'Shokolad ta’mi kuchli, mayin va yumshoq tort.',
    ingredients: [
      '200 g qora shokolad',
      '150 g sariyog‘',
      '150 g shakar',
      '3 dona tuxum',
      '100 g un',
      '2 osh qoshiq kakao',
      '1 chimdim tuz',
    ],
    steps: [
      'Pechni 180°C gacha qizdiring.',
      'Shokolad va sariyog‘ni ehtiyotkorlik bilan eritib oling.',
      'Tuxum va shakarni alohida idishda aralashtiring.',
      'Eritilgan shokoladni tuxumli aralashmaga qo‘shing.',
      'Un, kakao va tuzni solib, bir xil massa hosil qiling.',
      'Qolipga quyib, taxminan 20–25 daqiqa pishiring.',
      'Sovigach, bo‘laklarga kesib torting.',
    ],
    tip: 'Tortni ortiqcha pishirmang. Pishirish vaqti pech va qolipga qarab farq qilishi mumkin.',
  },
  {
    id: 5,
    name: 'Burger',
    category: 'Asosiy taom',
    price: 75000,
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
    description: 'Mol go‘shti, pishloq, yangi sabzavotlar va yumshoq bulochka.',
    ingredients: [
      '2 dona burger bulochkasi',
      '300 g mol qiymasi',
      '2 bo‘lak pishloq',
      '2 dona salat bargi',
      '1 dona pomidor',
      '1 dona kichik piyoz',
      '2 osh qoshiq burger sousi',
      'Ta’bga ko‘ra tuz va murch',
    ],
    steps: [
      'Qiymaga tuz va murch qo‘shib, ikkita kotlet shakllantiring.',
      'Kotletlarni to‘liq pishguncha tovaga yoki grilga qo‘ying.',
      'Pishish oxirida kotlet ustiga pishloq qo‘ying.',
      'Bulochkalarni kesib, ichki tomonini yengil qizartiring.',
      'Bulochkaga sous, salat bargi, kotlet, pomidor va piyoz joylashtiring.',
      'Ikkinchi bulochka qismini yopib, burgerni torting.',
    ],
    tip: 'Kotletning ichi ham to‘liq pishganini tekshiring. Bulochkani yengil qizartirish burgerni yanada mazali qiladi.',
  },
  {
    id: 6,
    name: 'Mevali ichimlik',
    category: 'Ichimlik',
    price: 25000,
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1000&q=80',
    description: 'Yangi mevalar va muz bilan tayyorlangan salqin ichimlik.',
    ingredients: [
      '200 g mavsumiy mevalar',
      '300 ml sovuq suv',
      '1 osh qoshiq limon sharbati',
      '1–2 choy qoshiq asal yoki shakar',
      'Bir necha dona muz',
      'Yalpiz barglari',
    ],
    steps: [
      'Mevalarni yaxshilab yuving va kerakli bo‘laklarga bo‘ling.',
      'Mevalarni blenderga soling.',
      'Suv, limon sharbati va asalni qo‘shing.',
      'Bir xil massa hosil bo‘lguncha aralashtiring.',
      'Xohishga ko‘ra ichimlikni suzib oling.',
      'Stakanga muz solib, ichimlikni quying.',
      'Yalpiz barglari bilan bezatib torting.',
    ],
    tip: 'Ichimlikni yangi tayyorlangan holda torting. Mevalarning shirinligiga qarab asal miqdorini moslashtiring.',
  },
];

function DishDetails() {
  const { id } = useParams();

  const dish = dishes.find((item) => item.id === Number(id));

  if (!dish) {
    return (
      <section className="about-section">
        <h2>Taom topilmadi</h2>
        <Link to="/menu" className="main-button">
          Menyuga qaytish
        </Link>
      </section>
    );
  }

  return (
    <section className="dish-details">
      <Link to="/menu" className="back-link">
        ← Menyuga qaytish
      </Link>

      <div className="details-layout">
        <img
          className="details-image"
          src={dish.image}
          alt={dish.name}
        />

        <div className="details-content">
          <span className="dish-category">{dish.category}</span>

          <h1>{dish.name}</h1>

          <div className="details-rating">
            ★ {dish.rating}/5
          </div>

          <p className="details-description">
            {dish.description}
          </p>

          <h2>{dish.price.toLocaleString('uz-UZ')} so‘m</h2>

          <div className="recipe-section">
            <h3>Masalliqlar</h3>

            <ul>
              {dish.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h3>Tayyorlash</h3>

            <ol>
              {dish.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="recipe-tip">
            <h3>💡 Maslahat</h3>
            <p>{dish.tip}</p>
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
