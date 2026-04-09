import { message } from "antd"
import { ChangeEvent, useEffect, useMemo, useState } from "react"

export const APARTMENT_VIDEO_MAX_SIZE_MB = 20
const MAX_VIDEO_SIZE_BYTES = APARTMENT_VIDEO_MAX_SIZE_MB * 1024 * 1024

export type ImagePreview = {
     file: File
     url: string
}

export function useApartmentMediaState() {
     const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
     const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)

     const imagePreviews = useMemo(
          () =>
               selectedImageFiles.map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
               })),
          [selectedImageFiles],
     )

     const selectedVideoPreviewUrl = useMemo(
          () => (selectedVideoFile ? URL.createObjectURL(selectedVideoFile) : ""),
          [selectedVideoFile],
     )

     useEffect(() => {
          return () => {
               imagePreviews.forEach((item) => URL.revokeObjectURL(item.url))
          }
     }, [imagePreviews])

     useEffect(() => {
          return () => {
               if (selectedVideoPreviewUrl) {
                    URL.revokeObjectURL(selectedVideoPreviewUrl)
               }
          }
     }, [selectedVideoPreviewUrl])

     const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"))
          if (files.length === 0) return

          setSelectedImageFiles((prev) => {
               const merged = [...prev, ...files]
               if (merged.length > 10) {
                    message.warning("Tối đa 10 ảnh mỗi lần cập nhật")
               }
               return merged.slice(0, 10)
          })

          event.target.value = ""
     }

     const handleSelectVideo = (event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0]
          if (!file) return

          if (!file.type.startsWith("video/")) {
               message.error("Vui lòng chọn file video hợp lệ")
               event.target.value = ""
               return
          }

          if (file.size > MAX_VIDEO_SIZE_BYTES) {
               message.error(`Video không được vượt quá ${APARTMENT_VIDEO_MAX_SIZE_MB}MB`)
               event.target.value = ""
               return
          }

          setSelectedVideoFile(file)
          event.target.value = ""
     }

     const handleRemoveSelectedImage = (index: number) => {
          setSelectedImageFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
     }

     const handleRemoveSelectedVideo = () => {
          setSelectedVideoFile(null)
     }

     const resetMediaState = () => {
          setSelectedImageFiles([])
          setSelectedVideoFile(null)
     }

     return {
          selectedImageFiles,
          selectedVideoFile,
          imagePreviews,
          selectedVideoPreviewUrl,
          handleSelectImages,
          handleSelectVideo,
          handleRemoveSelectedImage,
          handleRemoveSelectedVideo,
          resetMediaState,
     }
}
