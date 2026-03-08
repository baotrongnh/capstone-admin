"use client";

import { Modal, Button } from "antd";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  PenTool,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface Contract {
  id: string;
  tenantName: string;
  tenantId: string;
  apartmentName: string;
  apartmentId: string;
  status: "draft" | "pending" | "active" | "terminated";
  startDate: string;
  endDate: string;
  rentAmount: number;
  createdAt: string;
}

export function ContractPreviewModal({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  /* ================= CANVAS ================= */

  const getPosition = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (isLocked || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    setIsDrawing(true);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || isLocked || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPosition(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    setSignatureData(null);
    setIsLocked(false);
    toast.info("Đã xóa chữ ký, có thể ký lại");
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");
    setSignatureData(dataUrl);
    setIsLocked(true);

    toast.success("Đã lưu chữ ký");
  };

  const handleSign = () => {
    if (!signatureData) {
      toast.error("Vui lòng ký tên trước");
      return;
    }

    toast.success("Hợp đồng đã được ký điện tử!");
    onOpenChange(false);
  };

  const handleDownloadPDF = () => {
    toast.info("Chức năng tải PDF sẽ được triển khai");
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={900}
      styles={{
        body: {
          padding: 24,
          maxHeight: "80vh",
          overflowY: "auto",
        },
      }}
      title={
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-purple-600" />
          <span className="font-bold">Xem trước hợp đồng thuê nhà</span>
        </div>
      }
    >
      {/* ================= CONTRACT ================= */}
      <div className="mx-auto max-w-[800px] bg-white border rounded-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase">HỢP ĐỒNG THUÊ CĂN HỘ</h1>
          <p className="text-sm text-muted-foreground">
            Số hợp đồng: <b>{contract.id}</b>
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="font-bold text-lg mb-3">I. Thông tin các bên</h2>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold">BÊN CHO THUÊ</p>
              <p>Chủ sở hữu căn hộ</p>
              <p>Điện thoại: 090xxxxxxx</p>
            </div>
            <div>
              <p className="font-semibold">BÊN THUÊ</p>
              <p>
                Họ tên: <b>{contract.tenantName}</b>
              </p>
              <p>Mã người thuê: {contract.tenantId}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="font-bold text-lg mb-3">II. Thông tin căn hộ</h2>
          <p>
            <b>{contract.apartmentName}</b> – {contract.apartmentId}
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="font-bold text-lg mb-3">III. Thời hạn</h2>
          <p>
            {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
          </p>
        </div>

        <Separator />

        <div>
          <h2 className="font-bold text-lg mb-3">IV. Giá thuê</h2>
          <p className="text-green-600 font-bold">
            {formatCurrency(contract.rentAmount)} / tháng
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 pt-6 text-center text-sm">
          <div>
            <p className="font-semibold">BÊN CHO THUÊ</p>
            <p className="italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-semibold">BÊN THUÊ</p>
            <p className="italic">(Ký, ghi rõ họ tên)</p>
            {signatureData && (
              <img
                src={signatureData}
                alt="signature"
                className="mx-auto mt-3 h-20"
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= SIGNATURE ================= */}
      <div className="mt-8 text-center space-y-4">
        <p className="font-semibold text-sm">Vẽ chữ ký</p>

        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`mx-auto border rounded bg-white
            ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-crosshair"}
          `}
        />

        <div className="flex justify-center gap-3">
          <Button onClick={clearSignature}>
            <RotateCcw className="size-4 mr-2" />
            Xóa
          </Button>

          <Button type="primary" onClick={saveSignature} disabled={isLocked}>
            <PenTool className="size-4 mr-2" />
            Lưu chữ ký
          </Button>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={handleDownloadPDF}>
          <Download className="size-4 mr-2" />
          Tải PDF
        </Button>

        <Button onClick={() => onOpenChange(false)}>Đóng</Button>

        {signatureData && (
          <Button type="primary" onClick={handleSign}>
            <CheckCircle className="size-4 mr-2" />
            Gửi hợp đồng đã ký
          </Button>
        )}
      </div>
    </Modal>
  );
}
