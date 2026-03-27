"use client"

import { ApartmentDetailContent } from "@/components/apartment/apartment-detail-content"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

export default function OperatorApartmentDetailPage() {
     const params = useParams<{ id: string | string[] }>()
     const searchParams = useSearchParams()

     const mode = searchParams.get("mode") === "edit" ? "edit" : "view"
     const apartmentId = Array.isArray(params.id) ? params.id[0] : params.id

     return (
          <div className="space-y-4">
               <div>
                    <Button variant="outline" asChild>
                         <Link href="/operator/apartments">Quay lại danh sách</Link>
                    </Button>
               </div>

               <ApartmentDetailContent
                    apartmentId={apartmentId || null}
                    mode={mode}
               />
          </div>
     )
}
