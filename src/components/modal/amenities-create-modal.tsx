import { Input } from 'antd'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog, DialogFooter } from '../ui/dialog'
import { AmenityFormState } from '@/types/amenity'
import { Dispatch, SetStateAction } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

type AmenitiesProps = {
     isEdit: boolean,
     isDialogOpen: boolean,
     closeDialog: () => void
     form: AmenityFormState
     setForm: Dispatch<SetStateAction<AmenityFormState>>,
     handleSaveAmenity: () => void,
     isSaving: boolean
}

export default function AmenitiesCreateModal({ isEdit, isDialogOpen, closeDialog, form, setForm, handleSaveAmenity, isSaving }: AmenitiesProps) {
  return (
       <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-140">
                 <DialogHeader>
                      <DialogTitle>{isEdit ? 'Cập nhật tiện ích' : 'Thêm tiện ích'}</DialogTitle>
                      <DialogDescription>
                           Cập nhật metadata tiện ích theo chuẩn API hiện tại.
                      </DialogDescription>
                 </DialogHeader>

                 <div className="grid gap-4 py-2">
                      <div className="space-y-1">
                           <p className="text-xs text-muted-foreground">Mã tiện ích</p>
                           <Input
                                value={form.code}
                                placeholder="VD: gym"
                                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                           />
                      </div>

                      <div className="space-y-1">
                           <p className="text-xs text-muted-foreground">Tên tiện ích</p>
                           <Input
                                value={form.name}
                                placeholder="VD: Phòng gym"
                                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                           />
                      </div>

                      <div className="space-y-1">
                           <p className="text-xs text-muted-foreground">Icon</p>
                           <Input
                                value={form.icon}
                                placeholder="VD: dumbbell"
                                onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
                           />
                      </div>

                      <div className="space-y-1">
                           <p className="text-xs text-muted-foreground">Mô tả</p>
                           <Textarea
                                value={form.description}
                                placeholder="Mô tả ngắn về tiện ích"
                                onChange={(event) =>
                                     setForm((prev) => ({ ...prev, description: event.target.value }))
                                }
                           />
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                           <Checkbox
                                checked={form.isActive}
                                onCheckedChange={(checked) =>
                                     setForm((prev) => ({ ...prev, isActive: checked === true }))
                                }
                           />
                           Trạng thái hoạt động
                      </label>
                 </div>

                 <DialogFooter>
                      <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
                           Hủy
                      </Button>
                      <Button onClick={handleSaveAmenity} disabled={isSaving}>
                           {isSaving ? "Đang lưu..." : "Lưu"}
                      </Button>
                 </DialogFooter>
            </DialogContent>
       </Dialog>
  )
}
