import { PrismaClient, Role, TableStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Seed users
  const users = [
    {
      name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
      username: 'kitchen',
      password: await bcrypt.hash('12345678', saltRounds),
      role: Role.KITCHEN,
    },
    {
      name: 'Jane',
      last_name: 'Smith',
      phone_number: '0987654321',
      username: 'waiter',
      password: await bcrypt.hash('12345678', saltRounds),
      role: Role.WAITER,
    },
    {
      name: 'Mike',
      last_name: 'Johnson',
      phone_number: '1122334455',
      username: 'cashier',
      password: await bcrypt.hash('12345678', saltRounds),
      role: Role.CASHIER,
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  // Seed tables
  const tables = [
    { number: 1, numberOfChairs: 4,status: TableStatus.FREE, },
    { number: 2, numberOfChairs: 2,status: TableStatus.FREE, },
    { number: 3, numberOfChairs: 6,status: TableStatus.FREE, },
    { number: 4, numberOfChairs: 4,status: TableStatus.FREE, },
  ];

  for (const table of tables) {
    await prisma.table.create({
      data: table,
    });
  }

  // Seed categories
  const categories = [
    { name: 'Appetizers' },
    { name: 'Salads' },
    { name: 'Soups' },
    { name: "Kids' Menu" },
    { name: 'Desserts' },
    { name: 'Burgers & Sandwiches' },
    { name: 'Pizza' },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  // Seed meals
  const meals = [
    { name: 'Buffalo Wings', price: 1200, categoryId: 1, description: 'Spicy buffalo wings served with ranch dip' },
    { name: 'Mozzarella Sticks', price: 900, categoryId: 1, description: 'Crispy fried mozzarella sticks served with marinara sauce' },
    { name: 'Garlic Bread', price: 500, categoryId: 1, description: 'Toasted bread with garlic and butter' },

    { name: 'Caesar Salad', price: 1300, categoryId: 2, description: 'Romaine lettuce, croutons, and Caesar dressing' },
    { name: 'Greek Salad', price: 1100, categoryId: 2, description: 'Fresh vegetables, olives, and feta cheese' },
    { name: 'House Salad', price: 1000, categoryId: 2, description: 'Mixed greens, tomatoes, cucumbers, and house dressing' },

    { name: 'Tomato Soup', price: 700, categoryId: 3, description: 'Creamy tomato soup with basil' },
    { name: 'Chicken Noodle Soup', price: 900, categoryId: 3, description: 'Classic chicken soup with noodles' },
    { name: 'Minestrone Soup', price: 800, categoryId: 3, description: 'Vegetable soup with beans and pasta' },

    { name: 'Chicken Nuggets', price: 600, categoryId: 4, description: 'Crispy chicken nuggets served with fries' },
    { name: 'Kids’ Mac & Cheese', price: 700, categoryId: 4, description: 'Creamy macaroni and cheese' },
    { name: 'Kids’ Mini Pizza', price: 800, categoryId: 4, description: 'Personal-sized cheese pizza' },

    { name: 'Chocolate Cake', price: 1000, categoryId: 5, description: 'Rich chocolate cake with frosting' },
    { name: 'Ice Cream Sundae', price: 800, categoryId: 5, description: 'Vanilla ice cream with chocolate syrup and a cherry' },
    { name: 'Apple Pie', price: 900, categoryId: 5, description: 'Classic apple pie with a scoop of vanilla ice cream' },

    { name: 'Cheeseburger', price: 1500, categoryId: 6, description: 'Juicy beef patty with cheese, lettuce, and tomato' },
    { name: 'Chicken Sandwich', price: 1400, categoryId: 6, description: 'Grilled chicken breast with lettuce and mayo' },
    { name: 'BLT Sandwich', price: 1200, categoryId: 6, description: 'Bacon, lettuce, and tomato sandwich' },

    { name: 'Margherita Pizza', price: 1200, categoryId: 7, description: 'Classic pizza with fresh tomatoes, mozzarella, and basil' },
    { name: 'Pepperoni Pizza', price: 1400, categoryId: 7, description: 'Pizza topped with pepperoni slices and cheese' },
    { name: 'BBQ Chicken Pizza', price: 1600, categoryId: 7, description: 'Pizza with BBQ chicken, red onions, and cilantro' },
  ];

  for (const meal of meals) {
    await prisma.meal.create({
      data: meal,
    });
  }

  console.log('Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
