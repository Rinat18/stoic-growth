import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  const entries = await prisma.dailyEntry.findMany({
    orderBy: { date: 'desc' },
  })
  return Response.json(entries)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { date, relDone, workDone, reflection } = body

  const entry = await prisma.dailyEntry.upsert({
    where: { date: new Date(date) },
    update: { relDone, workDone, reflection },
    create: { date: new Date(date), relDone, workDone, reflection },
  })

  return Response.json(entry)
}
