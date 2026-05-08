"use client";

import { useMemo, useState } from "react";
import { useResolveTicket, useStaffTicket, useStaffTickets } from "@/hooks/query/useTickets";
import { TICKET_ACTION_LABELS, TICKET_STATUS_LABELS, type TicketItem, type TicketResolveAction } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString("vi-VN") : "-";

export default function StaffTicketsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<TicketResolveAction>("tenant_stays");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const { data, isLoading } = useStaffTickets({ type: "rent_overdue" });
  const { data: detail } = useStaffTicket(selectedId);
  const resolveTicket = useResolveTicket();
  const tickets = useMemo(() => {
    if (Array.isArray(data)) return data;
    const payload = data as { data?: unknown; items?: unknown } | undefined;
    if (Array.isArray(payload?.data)) return payload.data as TicketItem[];
    if (Array.isArray(payload?.items)) return payload.items as TicketItem[];
    if (payload?.data && typeof payload.data === "object" && Array.isArray((payload.data as { items?: unknown }).items)) {
      return (payload.data as { items: TicketItem[] }).items;
    }
    return [];
  }, [data]);

  const openResolve = (item: TicketItem) => {
    setSelectedId(item.id);
    setAction("tenant_stays");
    setNote("");
    setImages([]);
  };

  const close = () => {
    setSelectedId(null);
    setNote("");
    setImages([]);
  };

  const submit = async () => {
    if (!selectedId) return;
    if (!note.trim()) return;
    if (images.length === 0) return;
    await resolveTicket.mutateAsync({ id: selectedId, payload: { action, note: note.trim(), images } });
    close();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Kiểm tra căn hộ quá hạn</h1><p className="text-sm text-muted-foreground">Ticket quá hạn thanh toán, staff xác nhận tình trạng căn hộ và gửi ảnh bằng chứng.</p></div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Căn hộ</TableHead><TableHead>Hợp đồng</TableHead><TableHead>Hóa đơn</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày tạo</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} className="py-10 text-center">Đang tải...</TableCell></TableRow> : tickets.length === 0 ? <TableRow><TableCell colSpan={7} className="py-10 text-center">Không có ticket.</TableCell></TableRow> : tickets.map((item) => (
              <TableRow key={item.id}><TableCell><div className="font-medium">{item.ticketNumber}</div><div className="text-xs text-muted-foreground">{item.id}</div></TableCell><TableCell>{item.apartment?.apartmentNumber || "-"}</TableCell><TableCell>{item.rentalContract?.contractNumber || "-"}</TableCell><TableCell><div>{item.invoice?.invoiceNumber || "-"}</div><div className="text-xs text-muted-foreground">Hạn: {formatDate(item.invoice?.dueDate)}</div></TableCell><TableCell><Badge variant="outline">{TICKET_STATUS_LABELS[item.status] || item.status}</Badge></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell><TableCell className="text-right"><Button size="sm" disabled={["resolved", "closed"].includes(item.status)} onClick={() => openResolve(item)}>Xem & xác nhận</Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Xác nhận kiểm tra căn hộ</DialogTitle><DialogDescription>{detail?.ticketNumber} • {detail?.apartment?.apartmentNumber}</DialogDescription></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2"><Info label="Hợp đồng" value={detail?.rentalContract?.contractNumber || "-"} /><Info label="Hóa đơn" value={detail?.invoice?.invoiceNumber || "-"} /><Info label="Hạn thanh toán" value={formatDate(detail?.invoice?.dueDate)} /><Info label="Trạng thái" value={detail ? TICKET_STATUS_LABELS[detail.status] || detail.status : "-"} /></div>
          <div className="space-y-3"><Select value={action} onValueChange={(value) => setAction(value as TicketResolveAction)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TICKET_ACTION_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú xác nhận..." rows={4} /><Input type="file" accept="image/*" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []))} /><p className="text-xs text-muted-foreground">Ảnh bằng chứng là bắt buộc.</p></div>
          <DialogFooter><Button variant="outline" onClick={close}>Hủy</Button><Button disabled={resolveTicket.isPending || !note.trim() || images.length === 0} onClick={submit}>{resolveTicket.isPending ? "Đang gửi..." : "Xác nhận"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>; }
