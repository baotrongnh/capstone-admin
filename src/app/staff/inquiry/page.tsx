/*
TABLE:
- ID
- Customer Name
- Phone
- Apartment
- Status
- Created At
- Last activity
- Action

INQUIRY DETAIL:
- Customer: 
     + Name
     + Phone
     + Email
     + Note
- Apartment: 
     + Name
     + Price
     + Status
     + Button view detail

UPDATE STATUS FOR INQUIRY:
- Contacted
- Interedted / Not 
- Scheduled Viewing
- Closed
*/

"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontalIcon,
  User,
  ExternalLink,
  ClipboardEdit,
  History,
  Phone,
  Mail,
  Home,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function InquiryPageStaff() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Yêu cầu</h2>
          <p className="text-muted-foreground">
            Theo dõi và cập nhật trạng thái tư vấn khách hàng.
          </p>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Căn hộ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hoạt động cuối</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mock Row */}
            <TableRow className="hover:bg-muted/20 transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">
                #IQ-9921
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Nguyễn Văn A</span>
                  <span className="text-xs text-muted-foreground">
                    0901.234.xxx
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="font-normal text-xs italic"
                  >
                    BS16-Vinhomes
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none">
                  Contacted
                </Badge>
              </TableCell>
              <TableCell className="text-sm">20/02/2026</TableCell>
              <TableCell className="text-sm text-muted-foreground italic flex items-center gap-1">
                <History className="size-3" /> 2 giờ trước
              </TableCell>
              <TableCell className="text-right">
                <ActionMenu />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ActionMenu() {
  const [modalType, setModalType] = useState<"detail" | "status" | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 outline-none">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setModalType("detail")}>
            <User className="mr-2 h-4 w-4 text-blue-500" /> Xem chi tiết yêu cầu
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalType("status")}>
            <ClipboardEdit className="mr-2 h-4 w-4 text-orange-500" /> Cập nhật
            trạng thái
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Xóa yêu cầu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MODAL: CHI TIẾT YÊU CẦU */}
      <Dialog
        open={modalType === "detail"}
        onOpenChange={() => setModalType(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5" /> Chi tiết khách hàng
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section: Customer */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Họ tên
                </p>
                <p className="text-sm font-medium">Nguyễn Văn A</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Số điện thoại
                </p>
                <p className="text-sm flex items-center gap-1">
                  <Phone className="size-3 text-green-600" /> 0901.234.xxx
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Email
                </p>
                <p className="text-sm flex items-center gap-1">
                  <Mail className="size-3 text-blue-600" /> vana@example.com
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Ghi chú từ khách
                </p>
                <p className="text-sm italic">
                  "Tôi muốn xem nhà vào sáng thứ 7 tuần này."
                </p>
              </div>
            </div>

            <Separator />

            {/* Section: Apartment */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                <Home className="size-4" /> Thông tin bất động sản
              </h4>
              <div className="flex justify-between items-center border p-3 rounded-md">
                <div>
                  <p className="text-sm font-semibold">
                    Căn hộ BS16 - Vinhomes Grand Park
                  </p>
                  <p className="text-xs text-red-600 font-bold">
                    $1,200 / month
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  Xem căn hộ <ExternalLink className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: CẬP NHẬT TRẠNG THÁI */}
      <Dialog
        open={modalType === "status"}
        onOpenChange={() => setModalType(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cập nhật tiến độ</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái để đội ngũ theo dõi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái mới</label>
              <Select defaultValue="contacted">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacted">
                    Contacted (Đã liên hệ)
                  </SelectItem>
                  <SelectItem value="interested">
                    Interested (Quan tâm)
                  </SelectItem>
                  <SelectItem value="not_interested">
                    Not Interested (Không quan tâm)
                  </SelectItem>
                  <SelectItem value="scheduled">
                    Scheduled Viewing (Hẹn xem nhà)
                  </SelectItem>
                  <SelectItem value="closed">Closed (Đã chốt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú nội bộ</label>
              <Textarea placeholder="Nhập kết quả cuộc gọi hoặc tình trạng khách..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)}>
              Hủy
            </Button>
            <Button onClick={() => setModalType(null)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
