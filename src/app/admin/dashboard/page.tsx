import { AdminSectionCards } from "./admin-section-cards"
import { ChartLineDotsColors } from "./chart"

export default function Dashboard() {
     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <AdminSectionCards />
                    <div className="flex gap-20">
                         <ChartLineDotsColors />
                         <ChartLineDotsColors />
                    </div>
               </div>
          </div>
     )
}
