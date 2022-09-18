// const { ingredients } = require("./ingredients");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// @TODO add ml and q

const ingredients = [
  {
    id: "1",
    name: "Leite",
    unit: "ml",
  },
  {
    id: "2",
    name: "Molho de Tomate",
    unit: "ml",
  },
  {
    id: "3",
    name: "Banana - Prata",
    unit: "q",
  },
  {
    id: "4",
    name: "Maça - Fuji",
    unit: "q",
  },
  {
    id: "5",
    name: "Maça - Gala",
    unit: "q",
  },
  {
    id: "6",
    name: "Morango",
    unit: "q",
  },
  {
    id: "7",
    name: "Amendoim - Torrado",
    unit: "g",
  },
  {
    id: "8",
    name: "Creme de Leite",
    unit: "g",
  },
  {
    id: "9",
    name: "Leite em Pó",
    unit: "g",
  },
  {
    id: "10",
    name: "Leite Condensado",
    unit: "g",
  },
  {
    id: "11",
    name: "Nhoque ",
    unit: "g",
  },
  {
    id: "12",
    name: "Açucar - Confeiteiro",
    unit: "g",
  },
  {
    id: "13",
    name: "Açucar - Cristal",
    unit: "g",
  },
  {
    id: "14",
    name: "Fermento em Pó",
    unit: "g",
  },
  {
    id: "15",
    name: "Cacau em Pó",
    unit: "g",
  },
  {
    id: "16",
    name: "Massa Folheada",
    unit: "g",
  },
  {
    id: "17",
    name: "Tapioca - Granulada",
    unit: "g",
  },
  {
    id: "18",
    name: "Aveia - Farelo",
    unit: "g",
  },
  {
    id: "19",
    name: "Aveia - Flocos",
    unit: "g",
  },
  {
    id: "20",
    name: "Ovos",
    unit: "q",
  },
  {
    id: "21",
    name: "Pimentão - Amarelo",
    unit: "p",
  },
  {
    id: "22",
    name: "Pimentão - Vermelho",
    unit: "p",
  },
  {
    id: "23",
    name: "Pimentão - Verde",
    unit: "p",
  },
  {
    id: "24",
    name: "Manteiga - Sem sal",
    unit: "g",
  },
  {
    id: "25",
    name: "Batata Inglesa",
    unit: "g",
  },
  {
    id: "26",
    name: "Carne Moida",
    unit: "g",
  },
  {
    id: "27",
    name: "Macarrão - Espaguete",
    unit: "g",
  },
  {
    id: "28",
    name: "Macarrão - Parafuso",
    unit: "g",
  },
  {
    id: "29",
    name: "Macarrão - Penne",
    unit: "g",
  },
  {
    id: "30",
    name: "Macarrão - Farfalle",
    unit: "g",
  },
  {
    id: "31",
    name: "Macarrão - Lasanha",
    unit: "g",
  },
  {
    id: "32",
    name: "Arroz - Branco",
    unit: "g",
  },
  {
    id: "33",
    name: "Arroz - Arbóreo",
    unit: "g",
  },
  {
    id: "34",
    name: "Arroz - Carnaroli",
    unit: "g",
  },
  {
    id: "35",
    name: "Feijão - Preto",
    unit: "g",
  },
  {
    id: "36",
    name: "Feijão - Carioca",
    unit: "g",
  },
  {
    id: "37",
    name: "Feijão - Vermelho",
    unit: "g",
  },
  {
    id: "38",
    name: "Batata Palha",
    unit: "g",
  },
  {
    id: "39",
    name: "Cenoura",
    unit: "g",
  },
  {
    id: "40",
    name: "Milho - Lata",
    unit: "g",
  },
  {
    id: "41",
    name: "Maionese - Pote",
    unit: "g",
  },
  {
    id: "42",
    name: "Tomate",
    unit: "g",
  },
  {
    id: "43",
    name: "Cebola",
    unit: "p",
  },
  {
    id: "44",
    name: "Abobora - Japonesa",
    unit: "g",
  },
  {
    id: "45",
    name: "Frango - Peito",
    unit: "g",
  },
  {
    id: "46",
    name: "Queijo - Mussarela",
    unit: "g",
  },
  {
    id: "47",
    name: "Queijo - Parmesão",
    unit: "g",
  },
  {
    id: "48",
    name: "Queijo - Brie",
    unit: "g",
  },
  {
    id: "49",
    name: "Presunto",
    unit: "g",
  },
  {
    id: "50",
    name: "Farinha - Trigo",
    unit: "g",
  },
  {
    id: "51",
    name: "Requeijão",
    unit: "g",
  },
  {
    id: "52",
    name: "Fermento Biologico - Seco",
    unit: "g",
  },
  {
    id: "53",
    name: "Fermento Químico",
    unit: "g",
  },
  {
    id: "54",
    name: "Água",
    unit: "ml",
  },
  {
    id: "55",
    name: "Sal",
    unit: "g",
  },
  {
    id: "56",
    name: "Canela - Pó",
    unit: "g",
  },
  {
    id: "57",
    name: "Canela",
    unit: "p",
  },
  {
    id: "58",
    name: "Baunilha - Extrato",
    unit: "ml",
  },
];

const prisma = new PrismaClient();

async function seed() {
  const seedUser = await prisma.user.findUnique({
    where: { email: "rachel@remix.run" },
  });

  if (!seedUser) {
    const email = "rachel@remix.run";
    const hashedPassword = await bcrypt.hash("racheliscool", 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
    await prisma.note.create({
      data: {
        title: "My first note",
        body: "Hello, world!",
        userId: user.id,
      },
    });
    await prisma.note.create({
      data: {
        title: "My second note",
        body: "Hello, world!",
        userId: user.id,
      },
    });
  }

  const currentIngredients = await prisma.ingredient.findMany();
  const deleteIngredients = currentIngredients.reduce((acc, curr) => {
    if (ingredients.some(({ id }) => id === curr.id)) {
      return acc;
    }
    return [...acc, curr];
  }, []);
  await Promise.all(
    deleteIngredients.map((ingredient) =>
      prisma.ingredient.delete({ where: { id: ingredient.id } })
    )
  );
  const seedIngredients = ingredients.reduce((acc, curr) => {
    if (currentIngredients.some(({ id }) => id === curr.id)) {
      return acc;
    }
    return [...acc, curr];
  }, []);
  await Promise.all(
    seedIngredients.map((ingredient) =>
      prisma.ingredient.create({ data: ingredient })
    )
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
