export const parseNumber = (value: string) => {
  const raw = value.trim()
  if (!raw) return undefined

  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

export const toOptionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined

  if (typeof value === "string") {
    return parseNumber(value)
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}