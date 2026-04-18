import { Button } from "@/components/ui/button"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"

type IotActionConfirmDialogProps = {
     data: {
          open: boolean
          isSubmitting: boolean
          title: string
          description: string
          confirmText: string
          submittingText: string
          cancelText?: string
          confirmVariant?: "default" | "destructive"
          onOpenChange: (open: boolean) => void
          onCancel: () => void
          onConfirm: () => void
     }
}

export function IotActionConfirmDialog({ data }: IotActionConfirmDialogProps) {
     const {
          open,
          isSubmitting,
          title,
          description,
          confirmText,
          submittingText,
          cancelText = "Hủy",
          confirmVariant = "default",
          onOpenChange,
          onCancel,
          onConfirm,
     } = data

     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent showCloseButton={!isSubmitting} className="sm:max-w-md">
                    <DialogHeader>
                         <DialogTitle>{title}</DialogTitle>
                         <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                         <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                              {cancelText}
                         </Button>
                         <Button variant={confirmVariant} onClick={onConfirm} disabled={isSubmitting}>
                              {isSubmitting ? submittingText : confirmText}
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     )
}
