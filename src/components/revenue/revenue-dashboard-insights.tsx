"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
     ChartContainer,
     ChartTooltip,
     ChartTooltipContent,
     type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { RevenueDashboardApiData, RevenueDashboardRankingItem } from "@/types/revenue"
import { formatVND } from "@/utils/format"
import { ChartNoAxesCombined, HandCoins, Inbox, ReceiptText, UsersRound, Wallet } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

type RevenueDashboardInsightsProps = {
     data?: RevenueDashboardApiData
     isLoading?: boolean
     className?: string
     title?: string
     description?: string
}

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

const MetricSkeleton = () => <Skeleton className="h-28 w-full rounded-xl" />
const CARD_HOVER_CLASS = "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"

const RankingSkeleton = () => (
     <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
               <Skeleton key={index} className="h-10 w-full rounded-md" />
          ))}
     </div>
)

const RankingTable = ({ title, description, items }: {
     title: string
     description: string
     items: RevenueDashboardRankingItem[]
}) => (
     <Card className={cn("border-border/70", CARD_HOVER_CLASS)}>
          <CardHeader>
               <CardTitle className="text-base">{title}</CardTitle>
               <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
               <Table>
                    <TableHeader>
                         <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Căn hộ</TableHead>
                              <TableHead>Tòa nhà</TableHead>
                              <TableHead className="text-right">Doanh thu</TableHead>
                              <TableHead className="text-right">Hóa đơn</TableHead>
                         </TableRow>
                    </TableHeader>
                    <TableBody>
                         {items.length > 0 ? (
                              items.map((item, index) => (
                                   <TableRow key={`${item.apartmentId}-${index}`} className="hover:bg-cyan-500/5">
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{item.apartmentNumber}</TableCell>
                                        <TableCell className="max-w-52 truncate text-muted-foreground">
                                             {item.buildingName ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{formatVND(item.paidRevenue, true)}</TableCell>
                                        <TableCell className="text-right">{item.invoiceCount}</TableCell>
                                   </TableRow>
                              ))
                         ) : (
                              <TableRow className="hover:bg-transparent">
                                   <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                        Chưa có dữ liệu.
                                   </TableCell>
                              </TableRow>
                         )}
                    </TableBody>
               </Table>
          </CardContent>
     </Card>
)

type DonutItem = {
     key: string
     label: string
     value: number
     color: string
}

type RevenueDonutCardProps = {
     title: string
     description: string
     totalLabel: string
     totalValue: number
     items: DonutItem[]
     isLoading: boolean
     valueFormatter?: (value: number) => string
}

const RevenueDonutCard = ({
     title,
     description,
     totalLabel,
     totalValue,
     items,
     isLoading,
     valueFormatter = (value) => value.toLocaleString("vi-VN"),
}: RevenueDonutCardProps) => {
     const hasChartData = totalValue > 0 && items.some((item) => item.value > 0)

     const chartConfig = items.reduce((config, item) => {
          config[item.key] = {
               label: item.label,
               color: item.color,
          }
          return config
     }, {} as ChartConfig)

     return (
          <Card className={cn("border-border/70", CARD_HOVER_CLASS)}>
               <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
               </CardHeader>

               <CardContent>
                    {isLoading ? (
                         <div className="space-y-3">
                              <Skeleton className="mx-auto h-52 w-52 rounded-full" />
                              <Skeleton className="h-8 w-full rounded-md" />
                              <Skeleton className="h-8 w-full rounded-md" />
                         </div>
                    ) : (
                         <div className="grid gap-4">
                              {hasChartData ? (
                                   <ChartContainer config={chartConfig} className="mx-auto h-56 w-full max-w-60">
                                        <PieChart>
                                             <ChartTooltip
                                                  cursor={false}
                                                  content={<ChartTooltipContent formatter={(value) => valueFormatter(Number(value))} />}
                                             />
                                             <Pie
                                                  data={items}
                                                  dataKey="value"
                                                  nameKey="label"
                                                  innerRadius={56}
                                                  outerRadius={88}
                                                  paddingAngle={3}
                                             >
                                                  {items.map((item) => (
                                                       <Cell key={item.key} fill={item.color} />
                                                  ))}
                                             </Pie>
                                        </PieChart>
                                   </ChartContainer>
                              ) : (
                                   <div className="mx-auto flex h-56 w-full max-w-60 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 text-center">
                                        <Inbox className="mb-2 size-6 text-muted-foreground" />
                                        <p className="text-sm font-medium">Không có dữ liệu biểu đồ</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Hãy thử mở rộng khoảng thời gian để xem phân bố.</p>
                                   </div>
                              )}

                              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                                   <p className="text-xs text-muted-foreground">{totalLabel}</p>
                                   <p className="mt-1 text-sm font-semibold">{valueFormatter(totalValue)}</p>
                              </div>

                              <div className="space-y-2">
                                   {items.map((item) => {
                                        const ratio = totalValue > 0 ? item.value / totalValue : 0

                                        return (
                                             <div key={item.key} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 transition-colors hover:bg-muted/60">
                                                  <div className="flex items-center gap-2">
                                                       <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                       <span className="text-sm text-muted-foreground">{item.label}</span>
                                                  </div>
                                                  <div className="text-right">
                                                       <p className="text-sm font-semibold">{valueFormatter(item.value)}</p>
                                                       <p className="text-xs text-muted-foreground">{formatPercent(ratio)}</p>
                                                  </div>
                                             </div>
                                        )
                                   })}
                              </div>
                         </div>
                    )}
               </CardContent>
          </Card>
     )
}

export function RevenueDashboardInsights({
     data,
     isLoading = false,
     className,
     title = "Tổng quan vận hành doanh thu",
     description = "Số liệu tổng hợp từ API dashboard cho admin/operator trong khoảng ngày đã chọn.",
}: RevenueDashboardInsightsProps) {
     const userStats = data?.userStats
     const occupancy = data?.occupancyStats
     const ranking = data?.apartmentRevenueStats
     const summary = data?.systemRevenueSummary

     const occupied = occupancy?.occupiedApartmentCount ?? 0
     const vacant = occupancy?.vacantApartmentCount ?? 0
     const totalApartments = occupied + vacant

     const totalUsers = userStats?.totalActiveUsers ?? 0
     const totalRevenueMix =
          (summary?.totalSystemRevenue ?? 0) +
          (summary?.totalPartnerGrossRevenue ?? 0) +
          (summary?.totalPartnerNetPayout ?? 0)

     const hasAnyData =
          (summary?.totalPaidRevenue ?? 0) > 0 ||
          (summary?.totalSystemRevenue ?? 0) > 0 ||
          (summary?.totalPartnerGrossRevenue ?? 0) > 0 ||
          (summary?.totalPartnerNetPayout ?? 0) > 0 ||
          (summary?.invoiceCount ?? 0) > 0 ||
          totalUsers > 0 ||
          totalApartments > 0 ||
          (ranking?.topApartments.length ?? 0) > 0 ||
          (ranking?.bottomApartments.length ?? 0) > 0

     const userDonutItems: DonutItem[] = [
          {
               key: "partners",
               label: "Partner",
               value: userStats?.totalActivePartners ?? 0,
               color: "#06b6d4",
          },
          {
               key: "users",
               label: "User thường",
               value: userStats?.totalActiveNonPartnerUsers ?? 0,
               color: "#10b981",
          },
     ]

     const occupancyDonutItems: DonutItem[] = [
          {
               key: "occupied",
               label: "Đang cho thuê",
               value: occupied,
               color: "#22c55e",
          },
          {
               key: "vacant",
               label: "Còn trống",
               value: vacant,
               color: "#64748b",
          },
     ]

     const revenueDonutItems: DonutItem[] = [
          {
               key: "system",
               label: "Doanh thu hệ thống",
               value: summary?.totalSystemRevenue ?? 0,
               color: "#0ea5e9",
          },
          {
               key: "gross",
               label: "Tổng gộp đối tác",
               value: summary?.totalPartnerGrossRevenue ?? 0,
               color: "#f59e0b",
          },
          {
               key: "payout",
               label: "Chi trả ròng đối tác",
               value: summary?.totalPartnerNetPayout ?? 0,
               color: "#f97316",
          },
     ]

     return (
          <div className={cn("grid gap-4", className)}>
               {!isLoading && !hasAnyData ? (
                    <Card className="border-border/70 bg-linear-to-br from-slate-500/5 to-cyan-500/5">
                         <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                              <Inbox className="mb-3 size-8 text-muted-foreground" />
                              <h3 className="text-lg font-semibold">Chưa có dữ liệu trong khoảng thời gian này</h3>
                              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                   Bạn có thể thử chọn khoảng ngày rộng hơn để hiển thị thống kê doanh thu, cơ cấu người dùng và xếp hạng căn hộ.
                              </p>
                         </CardContent>
                    </Card>
               ) : null}

               <Card className={cn("overflow-hidden border-border/70 bg-linear-to-br from-emerald-500/10 via-background to-cyan-500/5", CARD_HOVER_CLASS)}>
                    <CardHeader>
                         <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
                         <CardDescription>{description}</CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                         {isLoading ? (
                              Array.from({ length: 5 }).map((_, index) => <MetricSkeleton key={index} />)
                         ) : (
                              <>
                                   <Card className={cn("border-emerald-200/60 bg-emerald-500/5", CARD_HOVER_CLASS)}>
                                        <CardContent className="flex items-start justify-between p-4">
                                             <div>
                                                  <p className="text-xs text-muted-foreground">Tổng tiền đã thu</p>
                                                  <p className="mt-2 text-lg font-semibold">{formatVND(summary?.totalPaidRevenue ?? 0, true)}</p>
                                             </div>
                                             <Wallet className="size-4 text-emerald-600" />
                                        </CardContent>
                                   </Card>

                                   <Card className={cn("border-cyan-200/60 bg-cyan-500/5", CARD_HOVER_CLASS)}>
                                        <CardContent className="flex items-start justify-between p-4">
                                             <div>
                                                  <p className="text-xs text-muted-foreground">Doanh thu hệ thống</p>
                                                  <p className="mt-2 text-lg font-semibold">{formatVND(summary?.totalSystemRevenue ?? 0, true)}</p>
                                             </div>
                                             <ChartNoAxesCombined className="size-4 text-cyan-600" />
                                        </CardContent>
                                   </Card>

                                   <Card className={cn("border-amber-200/60 bg-amber-500/5", CARD_HOVER_CLASS)}>
                                        <CardContent className="flex items-start justify-between p-4">
                                             <div>
                                                  <p className="text-xs text-muted-foreground">Tổng gộp đối tác</p>
                                                  <p className="mt-2 text-lg font-semibold">{formatVND(summary?.totalPartnerGrossRevenue ?? 0, true)}</p>
                                             </div>
                                             <UsersRound className="size-4 text-amber-600" />
                                        </CardContent>
                                   </Card>

                                   <Card className={cn("border-orange-200/60 bg-orange-500/5", CARD_HOVER_CLASS)}>
                                        <CardContent className="flex items-start justify-between p-4">
                                             <div>
                                                  <p className="text-xs text-muted-foreground">Chi trả ròng đối tác</p>
                                                  <p className="mt-2 text-lg font-semibold">{formatVND(summary?.totalPartnerNetPayout ?? 0, true)}</p>
                                             </div>
                                             <HandCoins className="size-4 text-orange-600" />
                                        </CardContent>
                                   </Card>

                                   <Card className={cn("border-sky-200/60 bg-sky-500/5", CARD_HOVER_CLASS)}>
                                        <CardContent className="flex items-start justify-between p-4">
                                             <div>
                                                  <p className="text-xs text-muted-foreground">Số hóa đơn</p>
                                                  <p className="mt-2 text-lg font-semibold">{(summary?.invoiceCount ?? 0).toLocaleString("vi-VN")}</p>
                                             </div>
                                             <ReceiptText className="size-4 text-sky-600" />
                                        </CardContent>
                                   </Card>
                              </>
                         )}
                    </CardContent>
               </Card>

               <div className="grid gap-4 xl:grid-cols-3">
                    <RevenueDonutCard
                         title="Cơ cấu người dùng"
                         description="Tỷ trọng partner và user thường trong nhóm đang hoạt động."
                         totalLabel="Tổng người dùng hoạt động"
                         totalValue={totalUsers}
                         items={userDonutItems}
                         isLoading={isLoading}
                    />

                    <RevenueDonutCard
                         title="Tình trạng căn hộ"
                         description="Phân bố căn hộ đang cho thuê và còn trống."
                         totalLabel="Tổng căn hộ"
                         totalValue={totalApartments}
                         items={occupancyDonutItems}
                         isLoading={isLoading}
                    />

                    <RevenueDonutCard
                         title="Cơ cấu doanh thu"
                         description="So sánh ba dòng giá trị chính trong kỳ lọc."
                         totalLabel="Tổng ba nhóm doanh thu"
                         totalValue={totalRevenueMix}
                         items={revenueDonutItems}
                         isLoading={isLoading}
                         valueFormatter={(value) => formatVND(value, true)}
                    />
               </div>

               <div className="grid gap-4 xl:grid-cols-2">
                    {isLoading ? (
                         <>
                              <Card className="border-border/70">
                                   <CardHeader>
                                        <CardTitle className="text-base">Top căn hộ doanh thu</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <RankingSkeleton />
                                   </CardContent>
                              </Card>
                              <Card className="border-border/70">
                                   <CardHeader>
                                        <CardTitle className="text-base">Bottom căn hộ doanh thu</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <RankingSkeleton />
                                   </CardContent>
                              </Card>
                         </>
                    ) : (
                         <>
                              <RankingTable
                                   title="Top căn hộ doanh thu"
                                   description="Các căn hộ có paid revenue cao nhất trong khoảng lọc."
                                   items={ranking?.topApartments ?? []}
                              />
                              <RankingTable
                                   title="Bottom căn hộ doanh thu"
                                   description="Các căn hộ có paid revenue thấp nhất trong khoảng lọc."
                                   items={ranking?.bottomApartments ?? []}
                              />
                         </>
                    )}
               </div>
          </div>
     )
}
