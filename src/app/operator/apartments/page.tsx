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
                         <TableHead>Status</TableHead>
                         <TableHead>Inquiries</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
               </TableHeader>
               <TableBody>
                    <TableRow>
                         <TableCell>Wireless Mouse</TableCell>
                         <TableCell className="font-medium">Wireless Mouse</TableCell>
                         <TableCell>$29.99</TableCell>
                         <TableCell className="text-right">
                              <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                             <MoreHorizontalIcon />
                                             <span className="sr-only">Open menu</span>
                                        </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
