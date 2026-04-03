// Format số thành 70,000 hoặc 70,000 VNĐ
export const formatVND = (value: number | string, showVND = false) => {
  const num = typeof value === 'string' ? Number(value) : value
  const formatted = num.toLocaleString('en-US')
  return showVND ? `${formatted} VNĐ` : formatted
}

export const formatVNDInput = (value?: number | string | null) => {
  if (value === undefined || value === null || value === "") return ""

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, "").replace(/\s/g, ""))

  if (Number.isNaN(numeric)) return ""
  return numeric.toLocaleString("en-US")
}

export const parseVNDInput = (value: string) => {
  const raw = value.replace(/,/g, "").replace(/\s/g, "").trim()
  if (!raw) return undefined

  const numeric = Number(raw)
  return Number.isNaN(numeric) ? undefined : numeric
}

export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
}

export const formatPrice = (price: number) => (price / 1_000_000).toFixed(1) + ' tr'

export const formatArea = (area?: number) => area ? `${area} m²` : ''

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTimeFromString = (value?: string) => {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const APARTMENT_STATUS_LABELS: Record<string, string> = {
  available: "Còn trống",
  occupied: "Đang cho thuê",
  maintenance: "Bảo trì",
  reserved: "Đã đặt cọc",
  inactive: "Ngừng hoạt động",
}

export const formatStatus = (status?: string | null) => {
  if (!status) return "-"
  return APARTMENT_STATUS_LABELS[status] || status
}

export const APARTMENT_FURNITURE_LABELS: Record<string, string> = {
  unfurnished: "Không nội thất",
  semi_furnished: "Nội thất cơ bản",
  fully_furnished: "Đầy đủ nội thất"
}

export const formatFurniture = (status?: string | null) => {
  if (!status) return "-"
  return APARTMENT_FURNITURE_LABELS[status] || status
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString("vi-VN")
}
