import type { ImagePreview } from "@/hooks/apartment/use-apartment-media-state"
import { SectionCard, SectionTitle } from "@/components/apartment/apartment-shared/section-primitives"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Image as AntdImage } from "antd"
import { ImageIcon, PlayCircle, UploadIcon, Video, XIcon } from "lucide-react"
import { ChangeEvent, useState } from "react"

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

type VideoPreviewCardProps = {
     src: string
     title: string
     onOpen: (url: string, title: string) => void
}

function VideoPreviewCard({ src, title, onOpen }: VideoPreviewCardProps) {
     return (
          <button
               type="button"
               onClick={() => onOpen(src, title)}
               className="group relative w-full max-w-110 overflow-hidden rounded-xl border bg-black/70 text-left shadow-sm transition hover:shadow-md"
          >
               <video
                    src={src}
                    muted
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full object-cover"
               />
               <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
               <PlayCircle className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/95" />
               <p className="absolute bottom-2 left-3 right-3 text-center text-xs font-medium text-white">
                    {title}
               </p>
          </button>
     )
}

type MediaImageCardProps = {
     src: string
     alt: string
     onRemove?: () => void
     removeAriaLabel?: string
}

function MediaImageCard({ src, alt, onRemove, removeAriaLabel }: MediaImageCardProps) {
     return (
          <div className="relative w-full max-w-84">
               <AntdImage
                    src={src}
                    alt={alt}
                    className="w-full rounded-xl border object-cover"
                    style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
               />
               {onRemove ? (
                    <button
                         type="button"
                         onClick={(event) => {
                              event.stopPropagation()
                              onRemove()
                         }}
                         className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                         aria-label={removeAriaLabel}
                    >
                         <XIcon className="size-3" />
                    </button>
               ) : null}
          </div>
     )
}

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
     const [videoDialog, setVideoDialog] = useState<{
          open: boolean
          url: string | null
          title: string
     }>({
          open: false,
          url: null,
          title: "Video tour",
     })

     const openVideoDialog = (url: string, title: string) => {
          if (!url) return
          setVideoDialog({ open: true, url, title })
     }

     const closeVideoDialog = (open: boolean) => {
          setVideoDialog((prev) => ({
               open,
               url: open ? prev.url : null,
               title: prev.title,
          }))
     }

     const showEmptyImagePlaceholder = existingImages.length === 0 && selectedImagePreviews.length === 0
     const showEmptyVideoPlaceholder = !videoTourUrl && !selectedVideoPreviewUrl
     const showEmptyMedia = showEmptyImagePlaceholder && showEmptyVideoPlaceholder

     return (
          <SectionCard>
               <SectionTitle
                    title="Media"
                    description="Ảnh/video bấm vào để xem, upload bằng file thật"
                    icon={ImageIcon}
               />

               {editMode ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                         <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                              <p className="text-xs text-muted-foreground">Ảnh mới</p>
                              <label className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm hover:bg-muted">
                                   <UploadIcon className="size-4" />
                                   Tải ảnh lên
                                   <input type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
                              </label>
                              <p className="text-xs text-muted-foreground">Tối đa 10 ảnh cho mỗi lần lưu.</p>
                         </div>

                         <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                              <p className="text-xs text-muted-foreground">Video mới</p>
                              <label className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm hover:bg-muted">
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
                                   </div>
                              ) : null}
                         </div>
                    </div>
               ) : null}

               <div className="space-y-5">
                    <div className="space-y-2">
                         <p className="text-center text-xs text-muted-foreground md:text-left">Video</p>
                         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {videoTourUrl ? (
                                   <VideoPreviewCard
                                        src={videoTourUrl}
                                        title="Video tour hiện tại"
                                        onOpen={openVideoDialog}
                                   />
                              ) : null}

                              {selectedVideoPreviewUrl ? (
                                   <VideoPreviewCard
                                        src={selectedVideoPreviewUrl}
                                        title="Video mới đã chọn"
                                        onOpen={openVideoDialog}
                                   />
                              ) : null}
                         </div>

                         {showEmptyVideoPlaceholder ? (
                              <div className="w-full rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                                   Không có video
                              </div>
                         ) : null}
                    </div>

                    <div className="space-y-2">
                         <p className="text-center text-xs text-muted-foreground md:text-left">Hình ảnh</p>

                         {editMode && existingImages.length > 0 ? (
                              <AntdImage.PreviewGroup>
                                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {existingImages.map((src, index) => (
                                             <MediaImageCard
                                                  key={`${src}-${index}`}
                                                  src={src}
                                                  alt={`Apartment image ${index + 1}`}
                                                  onRemove={() => onRemoveExistingImage(index)}
                                                  removeAriaLabel={`Xóa ảnh hiện có ${index + 1}`}
                                             />
                                        ))}
                                   </div>
                              </AntdImage.PreviewGroup>
                         ) : null}

                         {editMode && selectedImagePreviews.length > 0 ? (
                              <AntdImage.PreviewGroup>
                                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {selectedImagePreviews.map((item, index) => (
                                             <MediaImageCard
                                                  key={`${item.file.name}-${index}`}
                                                  src={item.url}
                                                  alt={`Selected image ${index + 1}`}
                                                  onRemove={() => onRemoveSelectedImage(index)}
                                                  removeAriaLabel={`Xóa ảnh mới ${index + 1}`}
                                             />
                                        ))}
                                   </div>
                              </AntdImage.PreviewGroup>
                         ) : null}

                         {!editMode && existingImages.length > 0 ? (
                              <AntdImage.PreviewGroup>
                                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {existingImages.map((src, index) => (
                                             <MediaImageCard
                                                  key={`${src}-${index}`}
                                                  src={src}
                                                  alt={`Apartment image ${index + 1}`}
                                             />
                                        ))}
                                   </div>
                              </AntdImage.PreviewGroup>
                         ) : null}

                         {showEmptyImagePlaceholder ? (
                              <div className="w-full rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                                   Không có hình ảnh
                              </div>
                         ) : null}
                    </div>

                    {showEmptyMedia ? (
                         <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-center text-sm text-muted-foreground">
                              Không có hình ảnh / video
                         </div>
                    ) : null}
               </div>

               <Dialog open={videoDialog.open} onOpenChange={closeVideoDialog}>
                    <DialogContent className="max-w-3xl">
                         <DialogHeader>
                              <DialogTitle>{videoDialog.title}</DialogTitle>
                              <DialogDescription>Xem trước video ngay trên màn hình hiện tại.</DialogDescription>
                         </DialogHeader>

                         {videoDialog.url ? (
                              <video controls autoPlay className="h-auto max-h-[70vh] w-full rounded-lg border bg-black/80">
                                   <source src={videoDialog.url} />
                                   Trình duyệt của bạn không hỗ trợ phát video.
                              </video>
                         ) : null}
                    </DialogContent>
               </Dialog>
          </SectionCard>
     )
}
