
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: 'Milliy taomlar', slug: 'milliy-taomlar' },
  { name: 'Asosiy taomlar', slug: 'asosiy-taomlar' },
  { name: 'Ichimliklar', slug: 'ichimliklar' },
  { name: 'Desertlar', slug: 'desertlar' },
];

const dishes = [
  // MILLIY TAOMLAR
  {
    name: 'O‘zbek palovi',
    slug: 'ozbek-palovi',
    category: 'milliy-taomlar',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    description: 'An’anaviy usulda tayyorlangan guruch, sabzi va go‘shtli o‘zbek palovi.',
    ingredients: ['Guruch', 'Mol go‘shti', 'Sabzi', 'Piyoz', 'Yog‘', 'Ziravorlar'],
    steps: ['Masalliqlarni tayyorlang.', 'Go‘sht va sabzini qovuring.', 'Guruch va suv qo‘shing.', 'Guruch yumshaguncha pishiring.'],
  },
  {
    name: 'Qozon kabob',
    slug: 'qozon-kabob',
    category: 'milliy-taomlar',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    description: 'Kartoshka va ziravorlar bilan tayyorlangan to‘yimli go‘shtli taom.',
    ingredients: ['Mol go‘shti', 'Kartoshka', 'Piyoz', 'Ziravorlar', 'Yog‘'],
    steps: ['Go‘shtni bo‘laklang.', 'Kartoshkani tayyorlang.', 'Masalliqlarni qovuring.', 'Past olovda pishiring.'],
  },
  {
    name: 'Uy mantisi',
    slug: 'uy-mantisi',
    category: 'milliy-taomlar',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    description: 'Yumshoq xamir va shirali go‘shtli nachinkadan tayyorlangan manti.',
    ingredients: ['Un', 'Suv', 'Mol go‘shti', 'Piyoz', 'Tuz', 'Murch'],
    steps: ['Xamir qorib tindiring.', 'Nachinka tayyorlang.', 'Mantilarni tuging.', 'Bug‘da pishiring.'],
  },
  {
    name: 'Lag‘mon',
    slug: 'lagmon',
    category: 'milliy-taomlar',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    description: 'Sabzavotli va go‘shtli qayla bilan tortiladigan lag‘mon.',
    ingredients: ['Lag‘mon xamiri', 'Mol go‘shti', 'Qalampir', 'Sabzi', 'Piyoz', 'Pomidor'],
    steps: ['Xamirni tayyorlang.', 'Go‘sht va sabzavotlarni qovuring.', 'Qayla tayyorlang.', 'Xamir bilan torting.'],
  },
  {
    name: 'Norin',
    slug: 'norin',
    category: 'milliy-taomlar',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=900&q=80',
    description: 'Yupqa kesilgan xamir va go‘sht bilan tayyorlanadigan milliy taom.',
    ingredients: ['Xamir', 'Mol go‘shti', 'Piyoz', 'Tuz', 'Murch'],
    steps: ['Go‘shtni pishiring.', 'Xamirni yupqa yoying.', 'Xamirni pishirib ingichka kesing.', 'Go‘sht bilan aralashtiring.'],
  },
  {
    name: 'Shashlik',
    slug: 'shashlik',
    category: 'milliy-taomlar',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    description: 'Ziravorlar bilan marinadlangan va grilda pishirilgan shashlik.',
    ingredients: ['Mol go‘shti', 'Piyoz', 'Tuz', 'Murch', 'Ziravorlar'],
    steps: ['Go‘shtni bo‘laklang.', 'Ziravorlar bilan marinadlang.', 'Sixga torting.', 'To‘liq pishirib torting.'],
  },
  {
    name: 'Chuchvara',
    slug: 'chuchvara',
    category: 'milliy-taomlar',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    description: 'Mayda go‘shtli nachinkali xamirdan tayyorlangan chuchvara.',
    ingredients: ['Un', 'Mol go‘shti', 'Piyoz', 'Tuz', 'Murch'],
    steps: ['Xamir tayyorlang.', 'Nachinkani aralashtiring.', 'Chuchvara tuging.', 'Qaynab turgan suvda pishiring.'],
  },

  // ASOSIY TAOMLAR
  {
    name: 'Grilda pishgan tovuq',
    slug: 'gril-tovuq',
    category: 'asosiy-taomlar',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80',
    description: 'Ziravorlar bilan marinadlangan va grilda pishirilgan tovuq.',
    ingredients: ['Tovuq go‘shti', 'Sarimsoq', 'Yog‘', 'Paprika', 'Tuz', 'Murch'],
    steps: ['Tovuqni marinadlang.', 'Grilni qizdiring.', 'Tovuqni to‘liq pishiring.', 'Sabzavotlar bilan torting.'],
  },
  {
    name: 'Mol go‘shti steyki',
    slug: 'mol-goshti-steyki',
    category: 'asosiy-taomlar',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80',
    description: 'Mol go‘shtidan tayyorlangan steyk.',
    ingredients: ['Mol go‘shti', 'Zaytun yog‘i', 'Tuz', 'Murch', 'Rozmarin'],
    steps: ['Go‘shtni tayyorlang.', 'Ziravor va yog‘ surting.', 'Kerakli darajagacha pishiring.', 'Biroz tindirib torting.'],
  },
  {
    name: 'Qaymoqli makaron',
    slug: 'qaymoqli-makaron',
    category: 'asosiy-taomlar',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
    description: 'Qaymoqli sous va pishloq bilan tayyorlangan makaron.',
    ingredients: ['Makaron', 'Qaymoq', 'Pishloq', 'Sarimsoq', 'Tuz', 'Murch'],
    steps: ['Makaronni pishiring.', 'Sous tayyorlang.', 'Makaronni sous bilan aralashtiring.', 'Pishloq sepib torting.'],
  },
  {
    name: 'Sabzavotli gril',
    slug: 'sabzavotli-gril',
    category: 'asosiy-taomlar',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    description: 'Mavsumiy sabzavotlardan tayyorlangan yengil taom.',
    ingredients: ['Baqlajon', 'Qovoqcha', 'Qalampir', 'Zaytun yog‘i', 'Tuz'],
    steps: ['Sabzavotlarni yuving.', 'Bo‘laklarga kesing.', 'Yog‘ va ziravor qo‘shing.', 'Grilda pishiring.'],
  },
  {
    name: 'Tovuqli lavash',
    slug: 'tovuqli-lavash',
    category: 'asosiy-taomlar',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80',
    description: 'Tovuq go‘shti va yangi sabzavotli lavash.',
    ingredients: ['Lavash', 'Tovuq go‘shti', 'Pomidor', 'Bodring', 'Sous'],
    steps: ['Tovuqni pishiring.', 'Sabzavotlarni to‘g‘rang.', 'Masalliqlarni lavashga joylang.', 'O‘rab, qizartiring.'],
  },
  {
    name: 'Margarita pitsa',
    slug: 'margarita-pitsa',
    category: 'asosiy-taomlar',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80',
    description: 'Pomidor sousi va mozzarella pishlog‘i solingan klassik pitsa.',
    ingredients: ['Pitsa xamiri', 'Pomidor sousi', 'Mozzarella', 'Rayhon'],
    steps: ['Xamirni yoying.', 'Sous surting.', 'Pishloq va rayhon qo‘shing.', 'Pechda pishiring.'],
  },
  {
    name: 'Gamburger',
    slug: 'gamburger',
    category: 'asosiy-taomlar',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    description: 'Go‘shtli kotlet, sabzavot va maxsus sousli gamburger.',
    ingredients: ['Bulochka', 'Mol go‘shti', 'Salat bargi', 'Pomidor', 'Sous'],
    steps: ['Kotletni pishiring.', 'Bulochkani isitib oling.', 'Sabzavotlarni joylang.', 'Sous bilan yig‘ing.'],
  },
  {
    name: 'Tovuqli salat',
    slug: 'tovuqli-salat',
    category: 'asosiy-taomlar',
    price: 33000,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    description: 'Tovuq go‘shti va yangi sabzavotlardan tayyorlangan salat.',
    ingredients: ['Tovuq go‘shti', 'Salat bargi', 'Pomidor', 'Bodring', 'Sous'],
    steps: ['Tovuqni pishiring.', 'Sabzavotlarni yuving.', 'Masalliqlarni aralashtiring.', 'Sous qo‘shib torting.'],
  },


  {
    name: 'Muzli qahva',
    slug: 'muzli-qahva',
    category: 'ichimliklar',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
    description: 'Sovutilgan qahva, sut va muz bilan tayyorlangan ichimlik.',
    ingredients: ['Qahva', 'Sut', 'Muz', 'Shakar'],
    steps: ['Qahva damlang.', 'Sovuting.', 'Stakanga muz soling.', 'Qahva va sutni quying.'],
  },
  {
    name: 'Mevali kokteyl',
    slug: 'mevali-kokteyl',
    category: 'ichimliklar',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=80',
    description: 'Turli mevalardan tayyorlangan rang-barang kokteyl.',
    ingredients: ['Banan', 'Qulupnay', 'Yogurt', 'Asal'],
    steps: ['Mevalarni yuving.', 'Mevalarni maydalang.', 'Blenderda aralashtiring.', 'Darhol torting.'],
  },
  {
    name: 'Yalpizli choy',
    slug: 'yalpizli-choy',
    category: 'ichimliklar',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    description: 'Yalpiz bilan damlangan xushbo‘y issiq choy.',
    ingredients: ['Qora yoki ko‘k choy', 'Yalpiz', 'Suv', 'Limon'],
    steps: ['Choynakni isitib oling.', 'Choy va yalpiz soling.', 'Qaynoq suv quying.', 'Damlang va torting.'],
  },
  {
    name: 'Apelsin sharbati',
    slug: 'apelsin-sharbati',
    category: 'ichimliklar',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80',
    description: 'Apelsindan tayyorlangan tetiklantiruvchi sharbat.',
    ingredients: ['Apelsin', 'Muz'],
    steps: ['Apelsinlarni yuving.', 'Sharbatini siqing.', 'Stakanga quying.', 'Sovuq holda torting.'],
  },
  {
    name: 'Qulupnayli smuzi',
    slug: 'qulupnayli-smuzi',
    category: 'ichimliklar',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
    description: 'Qulupnay, banan va yogurtli quyuq ichimlik.',
    ingredients: ['Qulupnay', 'Banan', 'Yogurt', 'Asal'],
    steps: ['Mevalarni yuving.', 'Blenderga soling.', 'Yogurt bilan aralashtiring.', 'Sovuq holda torting.'],
  },

  // DESERTLAR
  {
    name: 'Tiramisu',
    slug: 'tiramisu',
    category: 'desertlar',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80',
    description: 'Qahva va yumshoq krem qatlamlaridan iborat italyan deserti.',
    ingredients: ['Savoyardi', 'Mascarpone', 'Qahva', 'Kakao', 'Shakar'],
    steps: ['Qahva tayyorlang.', 'Kremni aralashtiring.', 'Pechenye va kremni qatlamlang.', 'Sovutib torting.'],
  },
  {
    name: 'Chizkeyk',
    slug: 'chizkeyk',
    category: 'desertlar',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80',
    description: 'Krem-pishloq va pechenyeli asosdan tayyorlangan desert.',
    ingredients: ['Krem-pishloq', 'Pechenye', 'Sariyog‘', 'Shakar', 'Tuxum'],
    steps: ['Pechenyeli asos tayyorlang.', 'Kremli aralashmani tayyorlang.', 'Qolipga quying.', 'Pishirib sovuting.'],
  },
  {
    name: 'Shokoladli tort',
    slug: 'shokoladli-tort',
    category: 'desertlar',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    description: 'Shokoladli biskvit va kremdan tayyorlangan tort.',
    ingredients: ['Un', 'Kakao', 'Tuxum', 'Shakar', 'Sariyog‘', 'Shokolad'],
    steps: ['Biskvit masalliqlarini aralashtiring.', 'Biskvitni pishiring.', 'Krem tayyorlang.', 'Tortni yig‘ib sovuting.'],
  },
  {
    name: 'Medovik',
    slug: 'medovik',
    category: 'desertlar',
    price: 27000,
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80',
    description: 'Asal ta’mli yupqa qatlamlar va mayin kremli tort.',
    ingredients: ['Un', 'Asal', 'Tuxum', 'Shakar', 'Sariyog‘', 'Qaymoqli krem'],
    steps: ['Asalli xamir tayyorlang.', 'Yupqa qatlamlarni pishiring.', 'Krem surib qatlamlang.', 'Sovutib torting.'],
  },
  {
    name: 'Brauni',
    slug: 'brauni',
    category: 'desertlar',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
    description: 'Shokolad ta’mi kuchli, yumshoq desert.',
    ingredients: ['Shokolad', 'Sariyog‘', 'Un', 'Tuxum', 'Shakar'],
    steps: ['Shokolad va sariyog‘ni eriting.', 'Masalliqlarni aralashtiring.', 'Qolipga quying.', 'Pechda pishiring.'],
  },
  {
    name: 'Panna-kotta',
    slug: 'panna-kotta',
    category: 'desertlar',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    description: 'Mayin qaymoqdan tayyorlangan italyan deserti.',
    ingredients: ['Qaymoq', 'Sut', 'Shakar', 'Jelatin', 'Vanil'],
    steps: ['Qaymoq va shakarni isitib oling.', 'Jelatin qo‘shing.', 'Idishlarga quying.', 'Sovutib torting.'],
  },
];

async function main() {
  // Kategoriyalarni yaratish yoki yangilash
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  let added = 0;
  let updated = 0;

  for (const dish of dishes) {
    const category = await prisma.category.findUnique({
      where: { slug: dish.category },
    });

    if (!category) {
      throw new Error(`Kategoriya topilmadi: ${dish.category}`);
    }

    const data = {
      name: dish.name,
      description: dish.description,
      ingredients: dish.ingredients,
      steps: dish.steps,
      price: dish.price,
      image: dish.image,
      categoryId: category.id,
      isAvailable: true,
    };

    const existingDish = await prisma.dish.findUnique({
      where: { slug: dish.slug },
    });

    if (existingDish) {
      await prisma.dish.update({
        where: { slug: dish.slug },
        data,
      });

      updated++;
      console.log(`Yangilandi: ${dish.name}`);
    } else {
      await prisma.dish.create({
        data: {
          ...data,
          slug: dish.slug,
        },
      });

      added++;
      console.log(`Qo‘shildi: ${dish.name}`);
    }
  }

  console.log(`\nTugadi. Yangi: ${added}. Yangilandi: ${updated}.`);
}

main()
  .catch((error) => {
    console.error('Taomlarni saqlashda xatolik:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
