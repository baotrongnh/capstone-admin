"use client"

import { useApartment } from "@/hooks/query/useApartments"
import { formatVND } from "@/utils/format"

type ApartmentCardMessageProps = {
     apartmentId: string
}

export function ApartmentCardMessage({ apartmentId }: ApartmentCardMessageProps) {
     const { data, isLoading } = useApartment(apartmentId)
     const apartment = data?.data

     if (isLoading) {
          return <div className="text-xs text-gray-400 italic">Đang tải căn hộ...</div>
     }

     if (!apartment) {
          return <div className="text-xs text-red-400">Không tìm thấy căn hộ</div>
     }

     const thumbnail = apartment.images?.[0]

     return (
          <div className="mt-2 flex w-72 gap-3 rounded-lg border border-gray-200 bg-white p-2.5 text-left shadow-sm">
               {thumbnail ? (
                    <img
                         src={thumbnail}
                         alt={apartment.apartmentNumber}
                         className="h-16 w-16 shrink-0 rounded-md object-cover"
                    />
               ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
                         No image
                    </div>
               )}

               <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">
                         {apartment.buildingName || "Căn hộ"}
                    </p>
                    <p className="text-xs text-gray-500">Phòng {apartment.apartmentNumber}</p>
                    <p className="text-xs font-medium text-blue-600">
                         {formatVND(apartment.baseRentPrice)}/tháng
                    </p>
                    <p className="truncate text-xs text-gray-400">
                         {apartment.address || "Chưa có địa chỉ"}
                    </p>
               </div>
          </div>
     )
}
