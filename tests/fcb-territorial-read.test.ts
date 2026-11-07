import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
// @ts-expect-error Node native tests require explicit TypeScript extensions.
import { fcbReadSchema, fcbTerritorialConfiguration, FCB_TERRITORY_ID, FCB_REFERENCES_ID } from '../lib/fcb-territorial-source.ts'
// @ts-expect-error Node native tests require explicit TypeScript extensions.
import { mapTable } from '../lib/territorial-schema.ts'
// @ts-expect-error Node native tests require explicit TypeScript extensions.
import { mapTerritory } from '../lib/territorial-view-model.ts'
const snapshot = JSON.parse(readFileSync(new URL('./data/fcb-territory.json', import.meta.url), 'utf8'))
function source() {
  return {
    tables: { LIGUES: mapTable(snapshot.tables.LIGUES, fcbReadSchema.LIGUES), ENTENTES: mapTable(snapshot.tables.ENTENTES, fcbReadSchema.ENTENTES), CLUBS: mapTable(snapshot.tables.CLUBS, fcbReadSchema.CLUBS) },
    refs: { PROVINCES: mapTable(snapshot.refs.PROVINCES, ['id_province', 'nom_province']), VILLES: mapTable(snapshot.refs.VILLES, ['id_ville', 'nom_ville', 'id_province']), CATEGORIES_CLUB: mapTable(snapshot.refs.CATEGORIES_CLUB, ['id_categorie_club', 'nom_categorie_club']), SEXES: mapTable(snapshot.refs.SEXES, ['id_sexe', 'nom_sexe']) },
  }
}
test('live FCB snapshot: exactly 26 textual IDs, blank statuses, empty ententes/clubs', () => {
  const { tables, refs } = source(), data = mapTerritory(tables, refs)
  assert.deepEqual(data.ligues.map(row => row.idLigue), Array.from({ length: 26 }, (_, i) => String(i + 1).padStart(2, '0')))
  assert.ok(data.ligues.every(row => row.statut === ''))
  assert.equal(data.ententes.length, 0); assert.equal(data.clubs.length, 0)
  assert.equal(data.provinces.length, 26); assert.equal(data.cities.length, 36)
})
test('historical aliases are read without inventing code_club or exposing media', () => {
  const { tables, refs } = source()
  tables.LIGUES.rows[0].pseudo_ligue = 'BOX-KIN'; tables.LIGUES.rows[0].email_ligue = 'ligue@example.test'
  tables.ENTENTES.rows.push({ id_entente: '0102', code_entente: '02', nom_entente: 'Entente test', pseudo_entente: 'ENT-TEST', id_ligue: '01', id_ville: '', email_entente: 'entente@example.test', statut: '', observations: '' })
  tables.CLUBS.rows.push({ id_club: '0102001', nom_club: 'Club test', id_categorie: 'CCL001', id_sexe: 'SEX001', date_affiliation: '', id_ville: '', id_entente: '0102', id_ligue: '02', statut: '', observations: '' })
  const data = mapTerritory(tables, refs)
  assert.equal(data.ligues[0].sigleLigue, 'BOX-KIN'); assert.equal(data.ligues[0].emailLigue, 'ligue@example.test')
  assert.equal(data.ententes[0].pseudoEntente, 'ENT-TEST'); assert.equal(data.ententes[0].emailEntente, 'entente@example.test')
  assert.equal(data.clubs[0].idCategorieClub, 'CCL001'); assert.equal(data.clubs[0].categorie, 'AMATEUR')
  assert.equal(data.clubs[0].codeClub, ''); assert.equal(data.clubs[0].idLigue, '01'); assert.equal(data.clubs[0].idLigueHistorique, '02')
  assert.equal(data.clubs[0].logoDriveUrl, ''); assert.equal(data.diagnostics.length, 1)
})
test('missing parents keep historical club rows visible with a diagnostic', () => {
  const { tables, refs } = source()
  tables.CLUBS.rows.push({ id_club: '0102001', nom_club: 'Orphelin', id_entente: '0102', id_ligue: '01' })
  const data = mapTerritory(tables, refs)
  assert.equal(data.clubs.length, 1); assert.equal(data.clubs[0].idLigue, ''); assert.equal(data.diagnostics.length, 1)
})
test('empty sheet has headers; missing or duplicated headers and duplicate IDs fail', () => {
  assert.equal(mapTable([[...fcbReadSchema.CLUBS]], fcbReadSchema.CLUBS).rows.length, 0)
  assert.throws(() => mapTable([], fcbReadSchema.CLUBS))
  assert.throws(() => mapTable([['id_club', 'id_club']], ['id_club']))
  assert.throws(() => mapTable([['id_club'], ['01'], ['01']], ['id_club']))
})
const config = { FCB_STRUCTURE_TERRITORIALE_SPREADSHEET_ID: FCB_TERRITORY_ID, FCB_REFERENTIELS_SPREADSHEET_ID: FCB_REFERENCES_ID, GOOGLE_CLIENT_EMAIL: 'test@example.test', GOOGLE_PRIVATE_KEY: 'test-key' }
test('configuration accepts exact FCB IDs only and never falls back to FECOT', () => {
  assert.equal(fcbTerritorialConfiguration(config).territory, FCB_TERRITORY_ID)
  assert.throws(() => fcbTerritorialConfiguration({ ...config, FCB_STRUCTURE_TERRITORIALE_SPREADSHEET_ID: 'FECOT' }))
  assert.throws(() => fcbTerritorialConfiguration({ FECOT_STRUCTURE_TERRITORIALE_SPREADSHEET_ID: FCB_TERRITORY_ID }))
  assert.throws(() => fcbTerritorialConfiguration({ ...config, GOOGLE_PRIVATE_KEY: '' }))
})
