"use client"

import { ApartmentDetailEditor } from "@/components/apartment/apartment-detail-editor"
import { Button } from "@/components/ui/button"
import { useParams, useRouter, useSearchParams } from "next/navigation"

export default function OperatorApartmentDetailPage() {
     const router = useRouter()
     const params = useParams<{ id: string | string[] }>()
     const searchParams = useSearchParams()

     const mode = searchParams.get("mode") === "edit" ? "edit" : "view"
     const apartmentId = Array.isArray(params.id) ? params.id[0] : params.id

     return (
          <div className="space-y-4">
               <div>
                    <Button variant="outline" onClick={() => router.back()}>
                         Quay lại danh sách
                    </Button>
               </div>

               <ApartmentDetailEditor
                    apartmentId={apartmentId || null}
                    mode={mode}
               />
          </div>
     )
}
