export function isSidebarItemActive(pathname: string, itemUrl: string): boolean {
     if (!itemUrl || itemUrl === "#") return false
     return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`)
}
