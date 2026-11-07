import React from 'react'
import { createRoot } from 'react-dom/client'
import snapshot from '../data/fcb-territory.json'
import { mapTable } from '@/lib/territorial-schema'
import { fcbReadSchema } from '@/lib/fcb-territorial-source'
import { mapTerritory } from '@/lib/territorial-view-model'
import { TerritoryPage } from '@/components/territorial/page-client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
const tables = { LIGUES: mapTable(snapshot.tables.LIGUES, fcbReadSchema.LIGUES), ENTENTES: mapTable(snapshot.tables.ENTENTES, fcbReadSchema.ENTENTES), CLUBS: mapTable(snapshot.tables.CLUBS, fcbReadSchema.CLUBS) }
const refs = { PROVINCES: mapTable(snapshot.refs.PROVINCES, ['id_province', 'nom_province']), VILLES: mapTable(snapshot.refs.VILLES, ['id_ville', 'id_province', 'nom_ville']), CATEGORIES_CLUB: mapTable(snapshot.refs.CATEGORIES_CLUB, ['id_categorie_club', 'nom_categorie_club']), SEXES: mapTable(snapshot.refs.SEXES, ['id_sexe', 'nom_sexe']) }
const data = mapTerritory(tables, refs)
const root = createRoot(document.getElementById('root')!)
function render(kind: 'ligues' | 'ententes' | 'clubs' = 'ligues', error = '') {
  root.render(<DashboardLayout initialUser={{ estSuperAdmin: true, access: {} }}><TerritoryPage kind={kind} data={data} canWrite={false} error={error} /></DashboardLayout>)
}
Object.assign(window, { fcbRender: render })
// Test-only isolated component bundle, never imported by application routes.
window.fetch = async () => { throw new Error('Network requests are disabled in FCB list UI tests.') }
render()
