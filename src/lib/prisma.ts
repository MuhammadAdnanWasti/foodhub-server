import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ 
  connectionString,
  // Increase pool size for better connection handling
  pool: { min: 1, max: 10 }
})

const prisma = new PrismaClient({ 
  adapter,
  // Increase transaction timeout
  transactionOptions: {
    maxWait: 10000, // 10 seconds
    timeout: 30000, // 30 seconds
  }
})

export { prisma }
