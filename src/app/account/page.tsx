"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDefaultRouteByRole } from "@/constant/routes"
import { useAuthStore } from "@/stores/auth.store"
import { formatDateTime } from "@/utils/format"

const ROLE_LABELS: Record<string, string> = {
     admin: "Admin",
     operator: "Operator",
     staff: "Staff",
     partner: "Partner",
     user: "User",
}

const getInitials = (name?: string | null) =>
     (name || "User")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase() || "U"

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
     <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 font-medium">{value || "-"}</p>
     </div>
)

export default function AccountPage() {
     const router = useRouter()
     const user = useAuthStore((state) => state.user)
     const isHydrated = useAuthStore((state) => state.isHydrated)
     const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
     const roleLabel = user?.role ? ROLE_LABELS[user.role] || user.role : "-"
     const backUrl = getDefaultRouteByRole(user?.role) || "/"

     useEffect(() => {
          if (isHydrated && !isAuthenticated) {
               router.replace("/login")
          }
     }, [isAuthenticated, isHydrated, router])

     if (!isHydrated || !isAuthenticated || !user) return null

     return (
          <main className="min-h-svh bg-muted/40 p-4 md:p-8">
               <div className="mx-auto max-w-4xl space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                         <div>
                              <h1 className="text-2xl font-semibold tracking-tight">Tài khoản</h1>
                              <p className="mt-1 text-sm text-muted-foreground">Thông tin cơ bản của bạn.</p>
                         </div>
                         <Button variant="outline" onClick={() => router.push(backUrl)}>
                              <ArrowLeftIcon className="mr-1 size-4" />
                              Quay lại
                         </Button>
                    </div>

                    <Card className="border-border/70">
                         <CardHeader>
                              <CardTitle className="text-base">Hồ sơ</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-5">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                   <Avatar className="size-20 rounded-2xl">
                                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.fullName} />
                                        <AvatarFallback className="rounded-2xl text-lg">{getInitials(user.fullName)}</AvatarFallback>
                                   </Avatar>
                                   <div className="space-y-2">
                                        <div>
                                             <h2 className="text-xl font-semibold">{user.fullName}</h2>
                                             <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                             <Badge variant="outline">{roleLabel}</Badge>
                                             <Badge className={user.isActive ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-red-200 bg-red-100 text-red-700"}>
                                                  {user.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                                             </Badge>
                                        </div>
                                   </div>
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                   <InfoRow label="Họ tên" value={user.fullName} />
                                   <InfoRow label="Email" value={user.email} />
                                   <InfoRow label="Số điện thoại" value={user.phone} />
                                   <InfoRow label="Vai trò" value={roleLabel} />
                                   <InfoRow label="Mã nhân viên" value={user.employeeCode} />
                                   <InfoRow label="Phòng ban" value={user.department} />
                                   <InfoRow label="Tên đăng nhập" value={user.username} />
                                   <InfoRow label="Ngày tạo" value={formatDateTime(user.createdAt)} />
                              </div>
                         </CardContent>
                    </Card>
               </div>
          </main>
     )
}
