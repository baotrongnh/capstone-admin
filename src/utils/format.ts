// Format số thành 70,000 hoặc 70,000 VNĐ
export const formatVND = (value: number | string, showVND = false) => {
     const num = typeof value === 'string' ? Number(value) : value
     const formatted = num.toLocaleString('en-US')
     return showVND ? `${formatted} VNĐ` : formatted
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
