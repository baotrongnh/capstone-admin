import { Button } from "@/components/ui/button"
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table"
import { MoreHorizontalIcon } from "lucide-react"

export default function TableActions() {
     return (
          <Table>
               <TableHeader>
                    <TableRow>
                         <TableHead>ID</TableHead>
                         <TableHead>Name</TableHead>
                         <TableHead>Price</TableHead>
                         <TableHead>Inquiries</TableHead>
                         <TableHead>Current Tenant</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
               </TableHeader>
               <TableBody>
                    <TableRow>
                         <TableCell>A101</TableCell>
                         <TableCell className="font-medium">BS16 Vinhome GrandPark</TableCell>
                         <TableCell>$29.99</TableCell>
                         <TableCell>12</TableCell>
                         <TableCell>Nguyễn Văn A</TableCell>
                         <TableCell>Available</TableCell>
                         <TableCell className="text-right">
                              <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                             <MoreHorizontalIcon />
                                             <span className="sr-only">Open menu</span>
                                        </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View detail</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive">
                                             Delete
                                        </DropdownMenuItem>
                                   </DropdownMenuContent>
                              </DropdownMenu>
                         </TableCell>
                    </TableRow>
               </TableBody>
          </Table>
     )
}
