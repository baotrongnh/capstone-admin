export type TicketStatus = "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed" | "escalated";
export type TicketResolveAction = "tenant_left" | "tenant_stays";
export type TicketListQuery = { status?: TicketStatus; type?: "rent_overdue" | "rent_overdue_recovery" };

export type TicketItem = {
  id: string;
  ticketNumber: string;
  type: "rent_overdue" | "rent_overdue_recovery" | null;
  status: TicketStatus;
  resolutionAction?: TicketResolveAction | "paid" | null;
  resolutionNote?: string | null;
  resolutionImages?: string[] | null;
  invoice?: { id: string; invoiceNumber: string; status: string; issueDate: string; dueDate: string } | null;
  rentalContract: { id: string; contractNumber: string };
  apartment?: { id: string; apartmentNumber: string } | null;
  resolvedByStaff?: { id: string; fullName: string } | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketDetail = TicketItem;
export type ResolveTicketBody = { action: TicketResolveAction; note: string; images: File[] };

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Mới mở",
  in_progress: "Đang xử lý",
  waiting_for_user: "Chờ cư dân",
  resolved: "Đã xử lý",
  closed: "Đã đóng",
  escalated: "Đã chuyển cấp",
};

export const TICKET_ACTION_LABELS: Record<TicketResolveAction, string> = {
  tenant_stays: "Khách còn ở",
  tenant_left: "Khách đã rời đi / thu hồi căn hộ",
};
