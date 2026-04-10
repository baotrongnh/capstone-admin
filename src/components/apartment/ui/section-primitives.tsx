import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type LucideIcon, XIcon } from "lucide-react"
import { ReactNode } from "react"

type SectionCardProps = {
     children: ReactNode
     className?: string
}

type SectionTitleProps = {
     title: string
     description?: string
     icon: LucideIcon
}

type DetailItemProps = {
     label: string
     value?: string | number | null
     icon?: LucideIcon
}

type EditableTagListProps = {
     items: string[]
     onRemove: (item: string) => void
     emptyText: string
}

export function SectionCard({ children, className }: SectionCardProps) {
     return <section className={cn("rounded-xl border bg-card p-4 md:p-5 space-y-3 shadow-sm", className)}>{children}</section>
}

export function SectionTitle({ title, description, icon: Icon }: SectionTitleProps) {
     return (
          <div className="flex items-start gap-2">
               <span className="mt-0.5 rounded-md border bg-muted/50 p-1.5">
                    <Icon className="size-4 text-muted-foreground" />
               </span>
               <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
               </div>
          </div>
     )
}

export function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
     return (
          <div className="space-y-1 rounded-lg border bg-background p-3">
               <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {Icon ? <Icon className="size-3.5" /> : null}
                    {label}
               </p>
               <p className="text-sm font-semibold wrap-break-word">{value || "-"}</p>
          </div>
     )
}

export function EditableTagList({ items, onRemove, emptyText }: EditableTagListProps) {
     if (items.length === 0) {
          return <p className="text-xs text-muted-foreground">{emptyText}</p>
     }

     return (
          <div className="flex flex-wrap gap-2">
               {items.map((item) => (
                    <Badge key={item} variant="outline" className="gap-1">
                         {item}
                         <button
                              type="button"
                              onClick={() => onRemove(item)}
                              className="rounded p-0.5 hover:bg-muted"
                              aria-label={`Xoa ${item}`}
                         >
                              <XIcon className="size-3" />
                         </button>
                    </Badge>
               ))}
          </div>
     )
}
