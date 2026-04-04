export type AmenityLike = {
     id?: string | null
     code?: string | null
     name?: string | null
} | null | undefined

export type AmenityOption = {
     value: string
     label: string
}

const normalizeAmenityId = (value: unknown): string | null => {
     if (typeof value !== "string") return null
     const normalized = value.trim()
     return normalized ? normalized : null
}

const pickAmenityLabel = (item: AmenityLike, fallbackId: string) => {
     const name = typeof item?.name === "string" ? item.name.trim() : ""
     if (name) return name

     const code = typeof item?.code === "string" ? item.code.trim() : ""
     if (code) return code

     return fallbackId
}

export const mapAmenitiesToIds = (amenities?: AmenityLike[] | null): string[] => {
     if (!Array.isArray(amenities)) return []

     const seen = new Set<string>()
     const result: string[] = []

     for (const amenity of amenities) {
          const id = normalizeAmenityId(amenity?.id)
          if (!id || seen.has(id)) continue
          seen.add(id)
          result.push(id)
     }

     return result
}

export const mapAmenitiesToOptions = (amenities?: AmenityLike[] | null): AmenityOption[] => {
     if (!Array.isArray(amenities)) return []

     const seen = new Set<string>()
     const result: AmenityOption[] = []

     for (const amenity of amenities) {
          const id = normalizeAmenityId(amenity?.id)
          if (!id || seen.has(id)) continue
          seen.add(id)
          result.push({
               value: id,
               label: pickAmenityLabel(amenity, id),
          })
     }

     return result
}

export const mergeAmenityOptions = (
     ...groups: Array<AmenityOption[] | null | undefined>
): AmenityOption[] => {
     const map = new Map<string, string>()

     for (const group of groups) {
          if (!Array.isArray(group)) continue

          for (const option of group) {
               const id = normalizeAmenityId(option?.value)
               if (!id || map.has(id)) continue

               const label = typeof option?.label === "string" && option.label.trim()
                    ? option.label.trim()
                    : id
               map.set(id, label)
          }
     }

     return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

export const withFallbackAmenityOptions = (
     amenityIds?: string[] | null,
     options?: AmenityOption[] | null,
): AmenityOption[] => {
     const merged = mergeAmenityOptions(options)
     const known = new Set(merged.map((item) => item.value))

     for (const rawId of amenityIds || []) {
          const id = normalizeAmenityId(rawId)
          if (!id || known.has(id)) continue
          known.add(id)
          merged.push({ value: id, label: id })
     }

     return merged
}
