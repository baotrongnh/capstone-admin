"use client"

import { ApartmentDetailContent } from "@/components/apartment/apartment-detail-content"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type ApartmentDetailModalProps = {
     open: boolean
     apartmentId: string | null
     mode: "view" | "edit"
     onOpenChange: (open: boolean) => void
     allowEdit?: boolean
}

export function ApartmentDetailModal({
     open,
     apartmentId,
     mode,
     onOpenChange,
     allowEdit = true,
}: ApartmentDetailModalProps) {
     const handleOpenChange = (nextOpen: boolean) => {
          onOpenChange(nextOpen)
     }

     return (
          <Dialog open={open} onOpenChange={handleOpenChange}>
               <DialogContent className="sm:max-w-6xl p-0">
                    <ApartmentDetailContent
                         apartmentId={apartmentId}
                         mode={mode}
                         allowEdit={allowEdit}
                         inDialog
                    />
               </DialogContent>
          </Dialog>
     )
}
