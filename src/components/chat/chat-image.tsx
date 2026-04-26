"use client"

import Image from "next/image"
import { X } from "lucide-react"

type ChatImageGridProps = {
  images: string[]
  onPreview: (src: string) => void
}

type ChatImageLightboxProps = {
  image: string | null
  onClose: () => void
}

type ChatImagePreview = {
  key: string
  src: string
  alt: string
}

type ChatImagePreviewStripProps = {
  images: ChatImagePreview[]
  onRemove: (index: number) => void
}

export function ChatImageGrid({ images, onPreview }: ChatImageGridProps) {
  if (images.length === 0) return null

  return (
    <div className={`mt-2 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {images.map((src, index) => (
        <button
          key={`${src}-${index}`}
          type="button"
          onClick={() => onPreview(src)}
          className="group block overflow-hidden rounded-2xl bg-transparent text-left"
        >
          <Image
            src={src}
            alt={`attachment-${index + 1}`}
            width={420}
            height={320}
            unoptimized
            sizes="(max-width: 768px) 70vw, 320px"
            className="h-auto max-h-72 w-full cursor-zoom-in object-cover transition duration-200 group-hover:scale-[1.02]"
          />
        </button>
      ))}
    </div>
  )
}

export function ChatImagePreviewStrip({
  images,
  onRemove,
}: ChatImagePreviewStripProps) {
  if (images.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((image, index) => (
        <div key={image.key} className="relative overflow-hidden rounded-2xl">
          <Image
            src={image.src}
            alt={image.alt}
            width={72}
            height={72}
            unoptimized
            className="h-18 w-18 object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function ChatImageLightbox({
  image,
  onClose,
}: ChatImageLightboxProps) {
  if (!image) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/85 p-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close image preview"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close image preview"
      >
        <X className="size-5" />
      </button>
      <div className="relative mx-auto h-full w-full max-w-5xl">
        <Image
          src={image}
          alt="image preview"
          fill
          unoptimized
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </div>
  )
}
