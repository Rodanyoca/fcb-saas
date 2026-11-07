import { NextResponse } from "next/server"
import { requireTerritorialWrite } from "@/lib/territorial-api"
export const runtime = "nodejs"
export async function POST() {
  const denied = await requireTerritorialWrite()
  if (denied) return denied
  return NextResponse.json({ message: "Les nouveaux televersements sont hors perimetre FCB." }, { status: 409 })
}
