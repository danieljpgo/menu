// const { ingredients } = require("./ingredients");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const ingredients = [
  {
    name: "Batata Inglesa",
    unit: "g",
  },
  {
    name: "Carne Moida",
    unit: "g",
  },
  {
    name: "Macarrão - Espaguete",
    unit: "g",
  },
  {
    name: "Macarrão - Parafuso",
    unit: "g",
  },
  {
    name: "Macarrão - Penne",
    unit: "g",
  },
  {
    name: "Arroz - Branco",
    unit: "g",
  },
  {
    name: "Arroz - Arbóreo",
    unit: "g",
  },
  {
    name: "Arroz - Carnaroli",
    unit: "g",
  },
  {
    name: "Feijão - Preto",
    unit: "g",
  },
  {
    name: "Feijão - Carioca",
    unit: "g",
  },
  {
    name: "Feijão - Vermelho",
    unit: "g",
  },
  {
    name: "Batata Palha",
    unit: "g",
  },
  {
    name: "Cenoura",
    unit: "g",
  },
  {
    name: "Milho - Lata",
    unit: "g",
  },
  {
    name: "Maionese - Pote",
    unit: "g",
  },
  {
    name: "Tomate",
    unit: "g",
  },
  {
    name: "Cebola",
    unit: "p",
  },
  {
    name: "Abobora - Japonesa",
    unit: "g",
  },
  {
    name: "Frango - Peito",
    unit: "g",
  },
  {
    name: "Mussarela",
    unit: "g",
  },
  {
    name: "Presunto",
    unit: "g",
  },
  {
    name: "Farinha - Trigo",
    unit: "g",
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
    if (
      ingredients.some(
        ({ name, unit }) => name === curr.name && unit === curr.unit
      )
    ) {
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
    if (
      currentIngredients.some(
        ({ name, unit }) => name === curr.name && unit === curr.unit
      )
    ) {
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
