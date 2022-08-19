// const { ingredients } = require("./ingredients");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const ingredients = [
  {
    name: "Batata Inglesa",
    unit: "g",
  },
  {
    name: "Carne Moida - Patinho",
    unit: "g",
  },
  {
    name: "Macarrão - Espaguete",
    unit: "g",
  },
  {
    name: "Arroz - Branco",
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
  // await Promise.all(
  //   currentIngredients.map((ingredient) =>
  //     prisma.ingredient.delete({ where: { id: ingredient.id } })
  //   )
  // );

  const newSeeds = ingredients.filter((ingredient) =>
    currentIngredients.some(({ name }) => ingredient.name === name)
  );

  console.log(newSeeds);
  await Promise.all(
    newSeeds.map((ingredient) => prisma.ingredient.create({ data: ingredient }))
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
