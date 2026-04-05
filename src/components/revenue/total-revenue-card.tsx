"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSignedPercent } from "@/utils/revenue-calc"
import { formatVND } from "@/utils/format"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"

type TotalRevenueCardTrend = {
     changePercent: number
     previousAmount: number
     comparisonLabel?: string
}

type TotalRevenueCardProps = {
     amount?: number
     label?: string
     trend?: TotalRevenueCardTrend
     isLoading?: boolean
     actionHref?: string
     actionLabel?: string
}

export function TotalRevenueCard({ amount = 0, label = "Doanh thu tổng hệ thống", trend, isLoading = false, actionHref, actionLabel }: TotalRevenueCardProps) {
     const change = trend?.changePercent ?? 0
     const isUp = change >= 0
     const showTrend = Boolean(trend)
     const showFooter = isLoading || showTrend || Boolean(actionHref && actionLabel)

     return (
          <Card className="border-border/70">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                         <CardDescription>{label}</CardDescription>

                         {isLoading ? (
                              <Skeleton className="h-10 w-56" />
                         ) : (
                              <CardTitle className="text-3xl font-bold tracking-tight">
                                   {formatVND(amount, true)}
                              </CardTitle>
                         )}
                    </div>

                    <div className="rounded-full border border-border/60 bg-background p-3 text-muted-foreground">
                         <Wallet className="size-5" />
                    </div>
               </CardHeader>

               {showFooter ? (
                    <CardContent className="pt-0">
                         <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                              {isLoading ? (
                                   <>
                                        <Skeleton className="h-4 w-64" />
                                        <Skeleton className="h-9 w-40" />
                                   </>
                              ) : (
                                   <>
                                        <div className="space-y-1">
                                             {showTrend ? (
                                                  <>
                                                       <p className={`flex items-center gap-2 text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
                                                            {isUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                                            {isUp ? "Tăng" : "Giảm"} {formatSignedPercent(change)} {trend?.comparisonLabel ?? "so với kỳ trước"}
                                                       </p>
                                                       <p className="text-sm text-muted-foreground">
                                                            Kỳ trước: {formatVND(trend?.previousAmount ?? 0, true)}
                                                       </p>
                                                  </>
                                             ) : null}
                                        </div>

                                        {actionHref && actionLabel ? (
                                             <Button asChild>
                                                  <Link href={actionHref}>
                                                       {actionLabel}
                                                       <ArrowRight className="size-4" />
                                                  </Link>
                                             </Button>
                                        ) : null}
                                   </>
                              )}
                         </div>
                    </CardContent>
               ) : null}
          </Card>
     )
}
