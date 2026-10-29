import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/argon2.js'

// Converte para hash Argon2id as senhas que ainda estão armazenadas em texto claro.
// Execute uma única vez com: node prisma/hash-passwords.js

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()

  for(const user of users) {
    // Senhas que já são hash Argon2 não são processadas novamente
    if(user.password.startsWith('$argon2')) continue

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(user.password) }
    })
    console.log(`Senha do usuário ${user.username} convertida para hash.`)
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
