import { Badge } from "@/components/ui/badge"
import { ImageIcon, UploadIcon, Video, XIcon } from "lucide-react"
import Image from "next/image"
import { ChangeEvent } from "react"
import { SectionCard, SectionTitle } from "./apartment-detail-shared"

type ImagePreview = {
     file: File
     url: string
}

type ApartmentMediaSectionProps = {
     editMode: boolean
     existingImages: string[]
     selectedImagePreviews: ImagePreview[]
     selectedVideoFile: File | null
     selectedVideoPreviewUrl: string
     videoTourUrl?: string
     onSelectImages: (event: ChangeEvent<HTMLInputElement>) => void
     onSelectVideo: (event: ChangeEvent<HTMLInputElement>) => void
     onRemoveExistingImage: (index: number) => void
     onRemoveSelectedImage: (index: number) => void
     onRemoveSelectedVideo: () => void
}

const ACTION_BUTTON_CLASS =
     "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm hover:bg-muted"

export function ApartmentMediaSection({
     editMode,
     existingImages,
     selectedImagePreviews,
     selectedVideoFile,
     selectedVideoPreviewUrl,
     videoTourUrl,
     onSelectImages,
     onSelectVideo,
     onRemoveExistingImage,
     onRemoveSelectedImage,
     onRemoveSelectedVideo,
}: ApartmentMediaSectionProps) {
     return (
          <SectionCard>
               <SectionTitle
                    title="Media"
                    description="Ảnh/video bấm vào để xem, upload bằng file thật"
                    icon={ImageIcon}
               />

               {editMode ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                         <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Ảnh mới</p>
                              <label className={ACTION_BUTTON_CLASS}>
                                   <UploadIcon className="size-4" />
                                   Tải ảnh lên
                                   <input type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
                              </label>
                              <p className="text-xs text-muted-foreground">Tối đa 10 ảnh cho mỗi lần lưu.</p>
                         </div>

                         <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Video mới</p>
                              <label className={ACTION_BUTTON_CLASS}>
                                   <Video className="size-4" />
                                   Tải video lên
                                   <input type="file" accept="video/*" className="hidden" onChange={onSelectVideo} />
                              </label>

                              {selectedVideoFile ? (
                                   <div className="space-y-2">
                                        <Badge variant="outline" className="gap-1">
                                             {selectedVideoFile.name}
                                             <button
                                                  type="button"
                                                  className="rounded p-0.5 hover:bg-muted"
                                                  onClick={onRemoveSelectedVideo}
                                                  aria-label="Xóa video đã chọn"
                                             >
                                                  <XIcon className="size-3" />
                                             </button>
                                        </Badge>

                                        {selectedVideoPreviewUrl ? (
                                             <a
                                                  href={selectedVideoPreviewUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-xs text-primary underline-offset-2 hover:underline"
                                             >
                                                  Xem video đã chọn
                                             </a>
                                        ) : null}
                                   </div>
                              ) : null}
                         </div>
                    </div>
               ) : null}

               {editMode && videoTourUrl ? (
                    <div className="space-y-1">
                         <p className="text-xs text-muted-foreground">Video tour hiện tại</p>
                         <a href={videoTourUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-2 hover:underline">
                              Xem video hiện tại
                         </a>
                    </div>
               ) : null}

               {editMode && existingImages.length > 0 ? (
                    <div className="space-y-2">
                         <p className="text-xs text-muted-foreground">Ảnh hiện có</p>
                         <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                              {existingImages.map((src, index) => (
                                   <div key={`${src}-${index}`} className="relative">
                                        <a href={src} target="_blank" rel="noreferrer">
                                             <Image
                                                  src={src}
                                                  alt={`Apartment image ${index + 1}`}
                                                  width={320}
                                                  height={180}
                                                  unoptimized
                                                  className="h-28 w-full rounded-lg border object-cover"
                                             />
                                        </a>
                                        <button
                                             type="button"
                                             onClick={() => onRemoveExistingImage(index)}
                                             className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                                             aria-label={`Xóa ảnh hiện có ${index + 1}`}
                                        >
                                             <XIcon className="size-3" />
                                        </button>
                                   </div>
                              ))}
                         </div>
                    </div>
               ) : null}

               {editMode && selectedImagePreviews.length > 0 ? (
                    <div className="space-y-2">
                         <p className="text-xs text-muted-foreground">Ảnh mới (chưa lưu)</p>
                         <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                              {selectedImagePreviews.map((item, index) => (
                                   <div key={`${item.file.name}-${index}`} className="relative">
                                        <a href={item.url} target="_blank" rel="noreferrer">
                                             <Image
                                                  src={item.url}
                                                  alt={`Selected image ${index + 1}`}
                                                  width={320}
                                                  height={180}
                                                  unoptimized
                                                  className="h-28 w-full rounded-lg border object-cover"
                                             />
                                        </a>
                                        <button
                                             type="button"
                                             onClick={() => onRemoveSelectedImage(index)}
                                             className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                                             aria-label={`Xóa ảnh mới ${index + 1}`}
                                        >
                                             <XIcon className="size-3" />
                                        </button>
                                   </div>
                              ))}
                         </div>
                    </div>
               ) : null}

               {!editMode && existingImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                         {existingImages.map((src, index) => (
                              <div key={`${src}-${index}`} className="relative">
                                   <a href={src} target="_blank" rel="noreferrer">
                                        <Image
                                             src={src}
                                             alt={`Apartment image ${index + 1}`}
                                             width={320}
                                             height={180}
                                             unoptimized
                                             className="h-28 w-full rounded-lg border object-cover"
                                        />
                                   </a>
                              </div>
                         ))}
                    </div>
               ) : null}

               {!editMode && videoTourUrl ? (
                    <div className="space-y-1">
                         <p className="text-xs text-muted-foreground">Video tour</p>
                         <a href={videoTourUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-2 hover:underline">
                              {videoTourUrl}
                         </a>
                    </div>
               ) : null}
          </SectionCard>
     )
}
