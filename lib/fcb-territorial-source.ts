export const FCB_TERRITORY_ID = '16Z8zzPSne-nQ-XpAV-ifaaKuQ95GOeiI90dKRByYKtw'
export const FCB_REFERENCES_ID = '1r5BQir1NTTInKTo7mcjtLMbV4AAaHc7LYDcbElIkjJ8'
// Historical FCB headers, read on Drive before implementing this adapter.
export const fcbReadSchema = {
  LIGUES: ['id_ligue', 'nom_ligue', 'pseudo_ligue', 'email_ligue', 'id_province', 'statut', 'observations'],
  ENTENTES: ['id_entente', 'code_entente', 'nom_entente', 'pseudo_entente', 'id_ligue', 'id_ville', 'email_entente', 'statut', 'observations'],
  CLUBS: ['id_club', 'nom_club', 'id_categorie', 'id_sexe', 'date_affiliation', 'id_ville', 'id_entente', 'id_ligue', 'statut', 'observations'],
} as const
export function fcbTerritorialConfiguration(values: Record<string, string | undefined>) {
  const required = (name: string) => { const value = values[name]?.trim(); if (!value) throw new Error(`Configuration manquante : ${name}.`); return value }
  const territory = required('FCB_STRUCTURE_TERRITORIALE_SPREADSHEET_ID')
  const references = required('FCB_REFERENTIELS_SPREADSHEET_ID')
  if (territory !== FCB_TERRITORY_ID || references !== FCB_REFERENCES_ID) throw new Error('Les classeurs configurés ne correspondent pas aux sources FCB validées.')
  return { territory, references, email: required('GOOGLE_CLIENT_EMAIL'), key: required('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n') }
}
