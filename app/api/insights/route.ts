import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  const insights = await prisma.insight.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(insights)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, source } = body

  const insight = await prisma.insight.create({
    data: { text, source },
  })

  return Response.json(insight)
}
