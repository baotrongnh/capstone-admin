"use client"

import type { BackofficeRole } from "@/constant/routes"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { ReactNode } from "react"

type RoleAccessGuardProps = {
     allowedRoles: BackofficeRole[]
     children: ReactNode
}

export function RoleAccessGuard({ allowedRoles, children }: RoleAccessGuardProps) {
     const router = useRouter()
     const isHydrated = useAuthStore((state) => state.isHydrated)
     const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
     const userRole = useAuthStore((state) => state.user?.role)
     const isAllowedRole = Boolean(userRole && allowedRoles.includes(userRole as BackofficeRole))

     useEffect(() => {
          if (!isHydrated) {
               return
          }

          if (!isAuthenticated || !userRole) {
               router.replace("/")
               return
          }

          if (!isAllowedRole) {
               router.replace("/")
          }
     }, [isAllowedRole, isAuthenticated, isHydrated, router, userRole])

     if (!isHydrated) {
          return null
     }

     if (!isAuthenticated || !isAllowedRole) {
          return null
     }

     return <>{children}</>
}
