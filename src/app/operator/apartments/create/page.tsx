"use client"

import { ApartmentDetailContent } from "@/components/apartment/apartment-editor-content"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateApartmentPage() {
     const router = useRouter()

     return (
          <div className="space-y-4">
               <div className="flex items-center justify-between">
                    <Button variant="outline" asChild>
                         <Link href="/operator/apartments">Quay lại danh sách</Link>
                    </Button>
               </div>

               <ApartmentDetailContent
                    apartmentId={null}
                    mode="create"
                    onCreateSuccess={() => router.push("/operator/apartments")}
                    onCreateCancel={() => router.push("/operator/apartments")}
               />
          </div>
     )
}
