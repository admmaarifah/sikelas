const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.dailyPayment.deleteMany({})
  await prisma.transaction.deleteMany({})
  console.log('Successfully wiped all transactions and daily payments.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
