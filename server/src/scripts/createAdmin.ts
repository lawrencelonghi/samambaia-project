import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n=== Criar Novo Admin ===\n');

    const username = await question('Digite o username: ');
    const password = await question('Digite a senha: ');

    if (!username || !password) {
      console.error('❌ Username e senha são obrigatórios!');
      process.exit(1);
    }

    // Verificar se já existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      console.error(`❌ Admin com username "${username}" já existe!`);
      process.exit(1);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar admin
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    console.log('\n✅ Admin criado com sucesso!');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Criado em: ${admin.createdAt}\n`);

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();