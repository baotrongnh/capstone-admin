import type { UploadFile } from "antd";

export interface StaffUpdate {
  exteriorCondition: string;
  interiorCondition: string;
  notes: string;
  files: UploadFile[];
  updatedDate: string;
}

export interface Request {
  id: string;
  apartmentName: string;
  partner: string;
  location: string;
  bedrooms: number;
  area: string;
  price: string;
  deposit: string;
  status: "submitted" | "approved" | "rejected";
  submittedDate: string;
  staffUpdate?: StaffUpdate;
  owner?: {
    fullName: string;
    phone: string;
  };
  wardName?: string;
}
