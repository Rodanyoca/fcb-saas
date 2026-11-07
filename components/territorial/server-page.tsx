import { getTerritorialData } from "@/lib/territorial-data"
import { getSession } from "@/lib/auth"
import { TerritoryPage, type TerritoryData } from "./page-client"

export async function TerritoryServerPage({ kind }: { kind: "ligues" | "ententes" | "clubs" }) {
  let data: TerritoryData = { diagnostics: [], ligues: [], ententes: [], clubs: [], provinces: [], cities: [], categories: [], sexes: [] }, error = "", canWrite = false
  try {
    const session = await getSession()
    const loaded = await getTerritorialData()
    void session
    data = loaded
    canWrite = false // First delivery: lists only, including for administrators.
  } catch {
    error = "Le référentiel territorial n’a pas pu être chargé. Vérifiez les variables FCB, les accès Google et le réseau. Aucune donnée de remplacement n’est affichée."
  }
  return <TerritoryPage kind={kind} data={data} error={error} canWrite={canWrite} />
}
