
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Kategoriyalar
  const categories = [
    { name: 'Asosiy taomlar', slug: 'asosiy-taomlar' },
    { name: 'Salatlar', slug: 'salatlar' },
    { name: 'Desertlar', slug: 'desertlar' },
    { name: 'Ichimliklar', slug: 'ichimliklar' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  // 2. Taomlar va ularning rasmlari
  const dishes = [
    {
      name: 'O‘zbek palovi',
      slug: 'ozbek-palovi',
      description:
        'An’anaviy usulda tayyorlangan, xushbo‘y va mazali o‘zbek palovi.',
      ingredients: [
        'Guruch',
        'Mol go‘shti',
        'Sabzi',
        'Piyoz',
        'O‘simlik yog‘i',
        'Tuz va ziravorlar',
      ],
      steps: [
        'Go‘shtni bo‘laklarga bo‘lib, yog‘da qovuring.',
        'Piyoz va sabzini qo‘shib, birga pishiring.',
        'Suv va ziravorlarni qo‘shing.',
        'Guruchni solib, suvini tortguncha pishiring.',
        'Past olovda dimlab, dasturxonga torting.',
      ],
      price: 65000,
      image:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80',
      categorySlug: 'asosiy-taomlar',
    },
    {
      name: 'Maxsus salat',
      slug: 'maxsus-salat',
      description:
        'Yangi sabzavotlar va mazali sous bilan tayyorlangan salat.',
      ingredients: [
        'Pomidor',
        'Bodring',
        'Salat barglari',
        'Ko‘katlar',
        'Zaytun yog‘i',
      ],
      steps: [
        'Sabzavotlarni yaxshilab yuving.',
        'Sabzavotlarni mayda bo‘laklarga to‘g‘rang.',
        'Ko‘katlar va zaytun yog‘ini qo‘shing.',
        'Aralashtirib, yangi holida torting.',
      ],
      price: 35000,
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80',
      categorySlug: 'salatlar',
    },
    {
      name: 'Shokoladli desert',
      slug: 'shokoladli-desert',
      description:
        'Mayin krem va shokolad ta’miga ega mazali desert.',
      ingredients: [
        'Shokolad',
        'Sut',
        'Un',
        'Shakar',
        'Tuxum',
      ],
      steps: [
        'Masalliqlarni bir idishda aralashtiring.',
        'Tayyor aralashmani qolipga quying.',
        'Duxovkada pishiring.',
        'Sovuting va dasturxonga torting.',
      ],
      price: 30000,
      image:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
      categorySlug: 'desertlar',
    },
    {
      name: 'Limonli ichimlik',
      slug: 'limonli-ichimlik',
      description:
        'Limon va yalpiz bilan tayyorlangan tetiklantiruvchi ichimlik.',
      ingredients: [
        'Limon',
        'Suv',
        'Yalpiz',
        'Shakar',
        'Muz',
      ],
      steps: [
        'Limondan sharbat siqib oling.',
        'Suv va oz miqdorda shakar qo‘shing.',
        'Yalpiz va muz soling.',
        'Aralashtirib, sovuq holda torting.',
      ],
      price: 18000,
      image:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=80',
      categorySlug: 'ichimliklar',
    },
  ];

  // 3. Taomlarni bazaga saqlash yoki yangilash
  for (const dish of dishes) {
    const { categorySlug, ...data } = dish;

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new Error(`Kategoriya topilmadi: ${categorySlug}`);
    }

    await prisma.dish.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categoryId: category.id,
      },
      create: {
        ...data,
        categoryId: category.id,
      },
    });
  }

  console.log('✅ Kategoriyalar, taomlar va rasmlar saqlandi!');
}

main()
  .catch((error) => {
    console.error('❌ Seed xatosi:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
