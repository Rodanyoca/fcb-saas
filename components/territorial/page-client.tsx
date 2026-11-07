"use client"
import { TerritoryContext } from "./context"
import { Shell } from "@/components/dashboard/shell"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { EntentesClient } from "@/components/ententes/ententes-client"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { DataLoadNotice } from "@/components/dashboard/data-load-notice"
import type { getTerritorialData } from "@/lib/territorial-data"

export type TerritoryData = Awaited<ReturnType<typeof getTerritorialData>>
export function TerritoryPage({ kind, data, canWrite, error }: { kind: "ligues" | "ententes" | "clubs"; data: TerritoryData; canWrite: boolean; error: string }) {
  if (error) return <Shell bare><div className="space-y-4 p-6"><DataLoadNotice visible description={error} /><a className="underline" href={`/${kind}`}>Reessayer</a></div></Shell>
  return <TerritoryContext value={{ canWrite: canWrite && !error, cities: data.cities, ligues: data.ligues, categories: data.categories, sexes: data.sexes }}><Shell bare>
    <p className="px-4 pt-4 text-sm text-muted-foreground sm:px-6">FCB : listes en lecture seule. Les formulaires seront raccordes apres votre validation.</p>
    {!!data.diagnostics?.length && <div role="alert" className="mx-4 mt-4 rounded-lg border p-4 sm:mx-6">{data.diagnostics.map(message => <p key={message}>{message}</p>)}</div>}
    {kind === "ligues" ? <LiguesClient ligues={data.ligues} ententes={data.ententes} clubs={data.clubs} athletes={[]} provinceOptions={data.provinces} relationsReady={!error} /> : kind === "ententes" ? <EntentesClient ententes={data.ententes} ligues={data.ligues} clubs={data.clubs} athletes={[]} dataLoadError={Boolean(error)} /> : <ClubsClient clubs={data.clubs} ententes={data.ententes} categories={data.categories} sexes={data.sexes} actorData={{ available: false, byClub: {}, ignoredRelations: 0 }} dataLoadError={Boolean(error)} />}
  </Shell></TerritoryContext>
}
