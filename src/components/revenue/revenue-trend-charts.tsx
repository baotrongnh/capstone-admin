"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import {
     Area,
     AreaChart,
     Bar,
     BarChart,
     CartesianGrid,
     Cell,
     Line,
     LineChart,
     Pie,
     PieChart,
     XAxis,
} from "recharts"

import {
     formatSignedPercent,
     REVENUE_PREVIOUS_LABEL,
} from "@/utils/revenue-calc"
import type { RevenuePeriod, RevenuePoint, RevenueTrend } from "@/types/revenue"
import { formatVND } from "@/utils/format"
import {
     Card,
     CardContent,
     CardDescription,
     CardFooter,
     CardHeader,
     CardTitle,
} from "@/components/ui/card"
import {
     ChartContainer,
     ChartTooltip,
     ChartTooltipContent,
     type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
     revenue: {
          label: "Doanh thu",
          color: "var(--chart-2)",
     },
     payout: {
          label: "Chi trả đối tác",
          color: "var(--chart-4)",
     },
     invoices: {
          label: "Số hóa đơn",
          color: "var(--chart-3)",
     },
} satisfies ChartConfig

type RevenueTrendChartsProps = {
     trend?: RevenueTrend
     piePoint?: RevenuePoint | null
     period: RevenuePeriod
     isLoading?: boolean
}

const PIE_COLORS = ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)"]

const CHART_STYLE_BY_PERIOD: Record<RevenuePeriod, "area" | "line" | "bar" | "bar-with-line"> = {
     day: "area",
     month: "line",
     quarter: "bar",
     year: "bar-with-line",
}

const formatTickLabel = (period: RevenuePeriod, label: string) => {
     if (period === "day") {
          return label.split("/")[0] ?? label
     }

     if (period === "month") {
          const month = Number(label.split("/")[0])
          return Number.isNaN(month) ? label : `T${month}`
     }

     return label
}

const getXAxisProps = (period: RevenuePeriod) => ({
     dataKey: "label" as const,
     tickLine: false,
     axisLine: false,
     tickMargin: 8,
     interval: 0 as const,
     minTickGap: 4,
     tickFormatter: (value: string) => formatTickLabel(period, String(value)),
     tick: {
          fontSize: period === "day" ? 10 : 11,
     },
     angle: period === "day" ? -35 : 0,
     textAnchor: period === "day" ? ("end" as const) : ("middle" as const),
})

const getChartMargin = (period: RevenuePeriod) => ({
     top: 12,
     left: 6,
     right: 6,
     bottom: period === "day" ? 30 : 8,
})

const renderTrendChart = (period: RevenuePeriod, points: RevenueTrend["points"]) => {
     const style = CHART_STYLE_BY_PERIOD[period]
     const xAxisProps = getXAxisProps(period)
     const chartMargin = getChartMargin(period)

     if (style === "area") {
          return (
               <AreaChart data={points} margin={chartMargin}>
                    <CartesianGrid vertical={false} />
                    <XAxis {...xAxisProps} />
                    <ChartTooltip
                         cursor={false}
                         content={
                              <ChartTooltipContent
                                   indicator="line"
                                   labelFormatter={(value) => `Mốc: ${String(value)}`}
                                   formatter={(value) => formatVND(Number(value), true)}
                              />
                         }
                    />
                    <Area
                         dataKey="totalSystemRevenue"
                         type="monotone"
                         stroke="var(--color-revenue)"
                         fill="var(--color-revenue)"
                         fillOpacity={0.22}
                         strokeWidth={2.5}
                    />
               </AreaChart>
          )
     }

     if (style === "line") {
          return (
               <LineChart data={points} margin={chartMargin}>
                    <CartesianGrid vertical={false} />
                    <XAxis {...xAxisProps} />
                    <ChartTooltip
                         cursor={false}
                         content={
                              <ChartTooltipContent
                                   indicator="line"
                                   labelFormatter={(value) => `Mốc: ${String(value)}`}
                                   formatter={(value) => formatVND(Number(value), true)}
                              />
                         }
                    />
                    <Line
                         dataKey="totalSystemRevenue"
                         type="monotone"
                         stroke="var(--color-revenue)"
                         strokeWidth={2.5}
                         dot={false}
                    />
               </LineChart>
          )
     }

     if (style === "bar") {
          return (
               <BarChart data={points} margin={chartMargin}>
                    <CartesianGrid vertical={false} />
                    <XAxis {...xAxisProps} />
                    <ChartTooltip
                         cursor={false}
                         content={
                              <ChartTooltipContent
                                   indicator="line"
                                   labelFormatter={(value) => `Mốc: ${String(value)}`}
                                   formatter={(value) => formatVND(Number(value), true)}
                              />
                         }
                    />
                    <Bar dataKey="totalSystemRevenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
               </BarChart>
          )
     }

     return (
          <BarChart data={points} margin={chartMargin}>
               <CartesianGrid vertical={false} />
               <XAxis {...xAxisProps} />
               <ChartTooltip
                    cursor={false}
                    content={
                         <ChartTooltipContent
                              indicator="line"
                              labelFormatter={(value) => `Mốc: ${String(value)}`}
                              formatter={(value) => formatVND(Number(value), true)}
                         />
                    }
               />
               <Bar dataKey="totalSystemRevenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
               <Line dataKey="totalPartnerNetPayout" type="monotone" stroke="var(--color-payout)" strokeWidth={2} dot={false} />
          </BarChart>
     )
}

export function RevenueTrendCharts({
     trend,
     piePoint,
     period,
     isLoading = false,
}: RevenueTrendChartsProps) {
     const points = trend?.points ?? []
     const isUp = (trend?.changePercent ?? 0) >= 0

     const pieData = [
          {
               key: "revenue",
               name: "Doanh thu từ hệ thống",
               value: piePoint?.totalSystemRevenue ?? 0,
          },
          {
               key: "payout",
               name: "Chi trả đối tác",
               value: piePoint?.totalPartnerNetPayout ?? 0,
          },
          {
               key: "gross",
               name: "Doanh thu từ đối tác",
               value: piePoint?.totalPartnerGrossRevenue ?? 0,
          },
     ]

     return (
          <div className="grid gap-4 px-4 lg:px-6">
               <Card>
                    <CardHeader>
                         <CardTitle>{trend?.title ?? "Doanh thu"}</CardTitle>
                         <CardDescription>{trend?.subtitle ?? "Dữ liệu tổng hợp"}</CardDescription>
                    </CardHeader>

                    <CardContent>
                         {isLoading ? (
                              <Skeleton className="h-64 w-full rounded-xl" />
                         ) : (
                              <ChartContainer config={chartConfig} className="h-64 w-full">
                                   {renderTrendChart(period, points)}
                              </ChartContainer>
                         )}
                    </CardContent>

                    <CardFooter className="flex-col items-start gap-2 text-sm">
                         {isLoading ? (
                              <>
                                   <Skeleton className="h-4 w-40" />
                                   <Skeleton className="h-4 w-44" />
                              </>
                         ) : (
                              <>
                                   <div className={`flex items-center gap-2 leading-none font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
                                        {isUp ? "Tăng" : "Giảm"} {formatSignedPercent(trend?.changePercent ?? 0)}
                                        {isUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                   </div>
                                   <div className="leading-none text-muted-foreground">
                                        Kỳ hiện tại: {formatVND(trend?.current ?? 0, true)} | {REVENUE_PREVIOUS_LABEL[period]}: {formatVND(trend?.previous ?? 0, true)}
                                   </div>
                              </>
                         )}
                    </CardFooter>
               </Card>

               <Card>
                    <CardHeader>
                         <CardTitle>Cơ cấu doanh thu kỳ tham chiếu</CardTitle>
                         <CardDescription>
                              {piePoint?.label
                                   ? `So sánh doanh thu hệ thống, gộp đối tác và chi trả đối tác (${piePoint.label})`
                                   : "So sánh doanh thu hệ thống, gộp đối tác và chi trả đối tác"}
                         </CardDescription>
                    </CardHeader>

                    <CardContent>
                         {isLoading ? (
                              <Skeleton className="h-72 w-full rounded-xl" />
                         ) : (
                              <div className="grid items-center gap-4 lg:grid-cols-[280px_1fr]">
                                   <ChartContainer config={chartConfig} className="mx-auto h-72 w-full max-w-[320px]">
                                        <PieChart>
                                             <ChartTooltip
                                                  cursor={false}
                                                  content={<ChartTooltipContent formatter={(value) => formatVND(Number(value), true)} />}
                                             />
                                             <Pie
                                                  data={pieData}
                                                  dataKey="value"
                                                  nameKey="name"
                                                  innerRadius={64}
                                                  outerRadius={110}
                                                  paddingAngle={3}
                                             >
                                                  {pieData.map((item, index) => (
                                                       <Cell key={item.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                  ))}
                                             </Pie>
                                        </PieChart>
                                   </ChartContainer>

                                   <div className="space-y-2">
                                        {pieData.map((item, index) => (
                                             <div key={item.key} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                                                  <div className="flex items-center gap-2">
                                                       <span
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                                       />
                                                       <span className="text-sm text-muted-foreground">{item.name}</span>
                                                  </div>
                                                  <span className="text-sm font-semibold">{formatVND(item.value, true)}</span>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         )}
                    </CardContent>
               </Card>
          </div>
     )
}
