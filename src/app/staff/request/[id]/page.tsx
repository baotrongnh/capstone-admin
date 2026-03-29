"use client";

import { RequestDetailContent } from "@/components/request/request-detail-content-staff";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function StaffRequestDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";
  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="space-y-4">
      <div>
        <Button variant="outline" asChild>
          <Link href="/staff/request">Quay lại danh sách</Link>
        </Button>
      </div>

      <RequestDetailContent apartmentId={requestId || null} mode={mode} />
    </div>
  );
}
