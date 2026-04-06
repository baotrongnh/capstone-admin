"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import {
     formatAbsolutePercent,
     formatSignedPercent,
     REVENUE_PREVIOUS_LABEL,
} from "@/utils/revenue-calc"
import type { RevenuePeriod, RevenueSummary } from "@/types/revenue"
import { formatVND } from "@/utils/format"
import { Badge } from "@/components/ui/badge"
import {
     Card,
     CardAction,
     CardDescription,
     CardFooter,
     CardHeader,
     CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type RevenueSummaryCardsProps = {
     summary?: RevenueSummary
     period: RevenuePeriod
     isLoading?: boolean
}

export function RevenueSummaryCards({ summary, period, isLoading = false }: RevenueSummaryCardsProps) {
     const changePercent = summary?.changePercent ?? 0
     const isUp = changePercent >= 0

     return (
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
               <Card className="@container/card">
                    <CardHeader>
                         <CardDescription>{summary?.title ?? "Doanh thu"}</CardDescription>

                         {isLoading ? (
                              <Skeleton className="h-9 w-40" />
                         ) : (
                              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                   {formatVND(summary?.current ?? 0, true)}
                              </CardTitle>
                         )}

                         <CardAction>
                              {isLoading ? (
                                   <Skeleton className="h-6 w-20" />
                              ) : (
                                   <Badge variant="outline" className={isUp ? "text-green-600" : "text-red-600"}>
                                        {isUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                        {formatSignedPercent(changePercent)}
                                   </Badge>
                              )}
                         </CardAction>
                    </CardHeader>

                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                         {isLoading ? (
                              <>
                                   <Skeleton className="h-4 w-32" />
                                   <Skeleton className="h-4 w-40" />
                              </>
                         ) : (
                              <>
                                   <div className={`line-clamp-1 flex gap-2 font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
                                        {isUp ? "Tăng" : "Giảm"} {formatAbsolutePercent(changePercent)}
                                        {isUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                   </div>
                                   <div className="text-muted-foreground">
                                        {REVENUE_PREVIOUS_LABEL[period]}: {formatVND(summary?.previous ?? 0, true)}
                                   </div>
                              </>
                         )}
                    </CardFooter>
               </Card>
          </div>
     )
}
