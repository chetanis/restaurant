import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

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
