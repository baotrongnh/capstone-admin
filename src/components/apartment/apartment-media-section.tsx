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

const ACTION_BUTTON_CLASS =
     "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm hover:bg-muted"
const MEDIA_PLACEHOLDER_CLASS =
     "flex min-h-28 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 text-center"
const MEDIA_BLOCK_CLASS = "mx-auto w-full max-w-5xl space-y-2"
const MEDIA_GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2"
const VIDEO_CARD_CLASS =
     "group relative w-full overflow-hidden rounded-xl border bg-black/70 text-left shadow-sm transition hover:shadow-md"
const VIDEO_THUMB_CLASS = "aspect-video w-full object-cover opacity-85 transition group-hover:opacity-95"
const IMAGE_THUMB_CLASS = "w-full rounded-xl border object-cover"

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
     const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false)
     const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
     const [videoPreviewTitle, setVideoPreviewTitle] = useState("Video tour")

     const openVideoDialog = (url: string, title: string) => {
          if (!url) return
          setVideoPreviewUrl(url)
          setVideoPreviewTitle(title)
          setIsVideoDialogOpen(true)
     }

     const closeVideoDialog = (open: boolean) => {
          setIsVideoDialogOpen(open)
          if (!open) {
               setVideoPreviewUrl(null)
          }
     }

     const showEmptyImagePlaceholder = existingImages.length === 0 && selectedImagePreviews.length === 0
     const showEmptyVideoPlaceholder = !videoTourUrl && !selectedVideoPreviewUrl

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
                              <label className={ACTION_BUTTON_CLASS}>
                                   <UploadIcon className="size-4" />
                                   Tải ảnh lên
                                   <input type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
                              </label>
                              <p className="text-xs text-muted-foreground">Tối đa 10 ảnh cho mỗi lần lưu.</p>
                         </div>

                         <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
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
                                   </div>
                              ) : null}
                         </div>
                    </div>
               ) : null}

               <div className={MEDIA_BLOCK_CLASS}>
                    <p className="text-center text-xs text-muted-foreground md:text-left">Video tour</p>
                    <div className={MEDIA_GRID_CLASS}>
                         {videoTourUrl ? (
                              <button
                                   type="button"
                                   onClick={() => openVideoDialog(videoTourUrl, "Video tour hiện tại")}
                                   className={VIDEO_CARD_CLASS}
                              >
                                   <video
                                        src={videoTourUrl}
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className={VIDEO_THUMB_CLASS}
                                   />
                                   <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                                   <PlayCircle className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/95" />
                                   <p className="absolute bottom-2 left-3 right-3 text-center text-xs font-medium text-white">Video tour hiện tại</p>
                              </button>
                         ) : null}

                         {selectedVideoPreviewUrl ? (
                              <button
                                   type="button"
                                   onClick={() => openVideoDialog(selectedVideoPreviewUrl, "Video mới (chưa lưu)")}
                                   className={VIDEO_CARD_CLASS}
                              >
                                   <video
                                        src={selectedVideoPreviewUrl}
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className={VIDEO_THUMB_CLASS}
                                   />
                                   <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                                   <PlayCircle className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/95" />
                                   <p className="absolute bottom-2 left-3 right-3 text-center text-xs font-medium text-white">Video mới đã chọn</p>
                              </button>
                         ) : null}
                    </div>

                    {showEmptyVideoPlaceholder ? (
                         <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border bg-linear-to-br from-slate-200/50 to-slate-400/30 shadow-sm">
                              <div className="h-40 w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(148,163,184,0.35),transparent_40%)]" />
                              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent" />
                              <PlayCircle className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/90" />
                              <p className="absolute bottom-2 left-3 right-3 text-center text-xs font-medium text-white">Chưa có video tour</p>
                         </div>
                    ) : null}
               </div>

               {editMode && existingImages.length > 0 ? (
                    <div className={MEDIA_BLOCK_CLASS}>
                         <p className="text-center text-xs text-muted-foreground md:text-left">Ảnh hiện có</p>
                         <AntdImage.PreviewGroup>
                              <div className={MEDIA_GRID_CLASS}>
                                   {existingImages.map((src, index) => (
                                        <div key={`${src}-${index}`} className="relative">
                                             <AntdImage
                                                  src={src}
                                                  alt={`Apartment image ${index + 1}`}
                                                  className={IMAGE_THUMB_CLASS}
                                                  style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
                                             />
                                             <button
                                                  type="button"
                                                  onClick={(event) => {
                                                       event.stopPropagation()
                                                       onRemoveExistingImage(index)
                                                  }}
                                                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                                                  aria-label={`Xóa ảnh hiện có ${index + 1}`}
                                             >
                                                  <XIcon className="size-3" />
                                             </button>
                                        </div>
                                   ))}
                              </div>
                         </AntdImage.PreviewGroup>
                    </div>
               ) : null}

               {editMode && selectedImagePreviews.length > 0 ? (
                    <div className={MEDIA_BLOCK_CLASS}>
                         <p className="text-center text-xs text-muted-foreground md:text-left">Ảnh mới (chưa lưu)</p>
                         <AntdImage.PreviewGroup>
                              <div className={MEDIA_GRID_CLASS}>
                                   {selectedImagePreviews.map((item, index) => (
                                        <div key={`${item.file.name}-${index}`} className="relative">
                                             <AntdImage
                                                  src={item.url}
                                                  alt={`Selected image ${index + 1}`}
                                                  className={IMAGE_THUMB_CLASS}
                                                  style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
                                             />
                                             <button
                                                  type="button"
                                                  onClick={(event) => {
                                                       event.stopPropagation()
                                                       onRemoveSelectedImage(index)
                                                  }}
                                                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                                                  aria-label={`Xóa ảnh mới ${index + 1}`}
                                             >
                                                  <XIcon className="size-3" />
                                             </button>
                                        </div>
                                   ))}
                              </div>
                         </AntdImage.PreviewGroup>
                    </div>
               ) : null}

               {!editMode && existingImages.length > 0 ? (
                    <div className={MEDIA_BLOCK_CLASS}>
                         <p className="text-center text-xs text-muted-foreground md:text-left">Ảnh căn hộ</p>
                         <AntdImage.PreviewGroup>
                              <div className={MEDIA_GRID_CLASS}>
                                   {existingImages.map((src, index) => (
                                        <div key={`${src}-${index}`} className="relative">
                                             <AntdImage
                                                  src={src}
                                                  alt={`Apartment image ${index + 1}`}
                                                  className={IMAGE_THUMB_CLASS}
                                                  style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
                                             />
                                        </div>
                                   ))}
                              </div>
                         </AntdImage.PreviewGroup>
                    </div>
               ) : null}

               {showEmptyImagePlaceholder ? (
                    <div className={`${MEDIA_PLACEHOLDER_CLASS} mx-auto max-w-xl`}>
                         <div>
                              <ImageIcon className="mx-auto mb-2 size-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Chưa có ảnh cho căn hộ này</p>
                         </div>
                    </div>
               ) : null}

               <Dialog open={isVideoDialogOpen} onOpenChange={closeVideoDialog}>
                    <DialogContent className="max-w-3xl">
                         <DialogHeader>
                              <DialogTitle>{videoPreviewTitle}</DialogTitle>
                              <DialogDescription>Xem trước video ngay trên màn hình hiện tại.</DialogDescription>
                         </DialogHeader>

                         {videoPreviewUrl ? (
                              <video controls autoPlay className="h-auto max-h-[70vh] w-full rounded-lg border bg-black/80">
                                   <source src={videoPreviewUrl} />
                                   Trình duyệt của bạn không hỗ trợ phát video.
                              </video>
                         ) : null}
                    </DialogContent>
               </Dialog>
          </SectionCard>
     )
}
