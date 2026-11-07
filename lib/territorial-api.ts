import "server-only"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { getNavigationAccess, getSession } from "./auth"
import { getTerritorialData, TERRITORIAL_CACHE_TAG } from "./territorial-data"
import type { Sheet } from "./territorial-schema"

const paths = { LIGUES: "ligues", ENTENTES: "ententes", CLUBS: "clubs" } as const
export async function requireTerritorialWrite() {
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse) return NextResponse.json({ message: "Connexion requise." }, { status: 401 })
  const access = await getNavigationAccess(session)
  if (!access["AUT-SPT:WRITE"]) return NextResponse.json({ message: "Modification non autorisée." }, { status: 403 })
  return null
}
export function invalidateTerritory() {
  revalidateTag(TERRITORIAL_CACHE_TAG, { expire: 0 })
  for (const path of ["/ligues", "/ententes", "/clubs", "/dashboard"]) revalidatePath(path)
}
export async function readTerritory(sheet: Sheet) {
  try {
    const data = await getTerritorialData()
    return NextResponse.json({ [paths[sheet]]: data[paths[sheet]], configured: true }, { headers: { "Cache-Control": "private, no-store" } })
  } catch { return NextResponse.json({ message: "Référentiel territorial indisponible." }, { status: 503 }) }
}
export async function mutateTerritory(_sheet: Sheet, _request: Request, _id?: string) {
  const denied = await requireTerritorialWrite()
  if (denied) return denied
  return NextResponse.json({ message: "Lot FCB listes en lecture seule. Les formulaires seront raccordes apres validation ; CLUBS necessite aussi code_club." }, { status: 409 })
}
