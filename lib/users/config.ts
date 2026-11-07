import "server-only"
export function getUsersSpreadsheetId(): string {
  const id = process.env.FCB_USERS_SPREADSHEET_ID?.trim()
  if (!id) throw new Error("FCB_USERS_SPREADSHEET_ID est manquant.")
  if (id === process.env.FECOT_USERS_SPREADSHEET_ID?.trim()) throw new Error("Le classeur utilisateurs FCB ne doit pas etre celui de FECOT.")
  return id
}
