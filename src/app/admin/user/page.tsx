"use client";

import { useUsers } from "@/hooks/query/useUsers";
import { TableUser } from "@/components/table/table-user";
import { UserListItem } from "@/types/user";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ModalDeleteUser from "@/components/modal/delete-user-modal";
import ModalEditUser from "@/components/modal/edit-user-modal";
import ModalEditStaff from "@/components/modal/edit-staff-modal";
import ModalDeleteStaff from "@/components/modal/delete-staff-modal";
import ModalAddStaff from "@/components/modal/add-staff-modal";
import ModalEditOperator from "@/components/modal/edit-operator-modal";
import ModalDeleteOperator from "@/components/modal/delete-operator-modal";
import ModalAddOperator from "@/components/modal/add-operator-modal";
import { Button, Select } from "antd";
import TableStaff from "@/components/table/table-staff";
import TableOperator from "@/components/table/table-operator";
import { useStaffs } from "@/hooks/query/useStaff";
import { StaffItem } from "@/lib/services/staff.service";
import { useOperators } from "@/hooks/query/useOperator";
import { OperatorItem } from "@/lib/services/operator.service";

export default function User() {
  const { data } = useUsers();

  const { data: staff } = useStaffs();
  const { data: operators } = useOperators();
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<OperatorItem | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStaffDetailDialogOpen, setIsStaffDetailDialogOpen] = useState(false);
  const [isOperatorDetailDialogOpen, setIsOperatorDetailDialogOpen] =
    useState(false);
  const [showModalDeleteUser, setShowModalDeleteUser] = useState(false);
  const [showModalEditUser, setShowModalEditUser] = useState(false);
  const [showModalDeleteStaff, setShowModalDeleteStaff] = useState(false);
  const [showModalEditStaff, setShowModalEditStaff] = useState(false);
  const [showModalAddStaff, setShowModalAddStaff] = useState(false);
  const [showModalDeleteOperator, setShowModalDeleteOperator] = useState(false);
  const [showModalEditOperator, setShowModalEditOperator] = useState(false);
  const [showModalAddOperator, setShowModalAddOperator] = useState(false);
  const [userType, setUserType] = useState<string>("user");
  const options = [
    { label: "Người dùng", value: "user" },
    { label: "Nhân viên", value: "staff" },
    { label: "Nhân viên vận hành", value: "operator" },
  ];

  const handleViewDetail = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (user: UserListItem) => {
    setSelectedUser(user);
    setShowModalEditUser(true);
  };

  const handleDelete = (user: UserListItem) => {
    setSelectedUser(user);
    setShowModalDeleteUser(true);
  };

  const handleViewDetailStaff = (staffMember: StaffItem) => {
    setSelectedStaff(staffMember);
    setIsStaffDetailDialogOpen(true);
  };

  const handleEditStaff = (staffMember: StaffItem) => {
    setSelectedStaff(staffMember);
    setShowModalEditStaff(true);
  };

  const handleDeleteStaff = (staffMember: StaffItem) => {
    setSelectedStaff(staffMember);
    setShowModalDeleteStaff(true);
  };

  const handleAddStaff = () => {
    setShowModalAddStaff(true);
  };

  const handleViewDetailOperator = (operatorMember: OperatorItem) => {
    setSelectedOperator(operatorMember);
    setIsOperatorDetailDialogOpen(true);
  };

  const handleEditOperator = (operatorMember: OperatorItem) => {
    setSelectedOperator(operatorMember);
    setShowModalEditOperator(true);
  };

  const handleDeleteOperator = (operatorMember: OperatorItem) => {
    setSelectedOperator(operatorMember);
    setShowModalDeleteOperator(true);
  };

  const handleAddOperator = () => {
    setShowModalAddOperator(true);
  };

  const users = data?.data || [];

  const staffs = staff?.data || [];

  const operatorsList = operators?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Quản lý người dùng
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin và quyền hạn của người dùng hệ thống
        </p>
      </div>

      <Select
        placeholder="Chọn quản lý người dùng"
        options={options}
        onChange={(value) => {
          setUserType(value);
        }}
        style={{ width: 200, marginBottom: 16 }}
      />

      {userType === "user" && (
        <>
          <TableUser
            users={users}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}
      {userType === "staff" && (
        <>
          <div className="flex justify-end mb-4">
            <Button type="primary" onClick={handleAddStaff}>
              + Thêm nhân viên
            </Button>
          </div>
          <TableStaff
            staff={staffs}
            onViewDetail={handleViewDetailStaff}
            onEdit={handleEditStaff}
            onDelete={handleDeleteStaff}
          />
        </>
      )}
      {userType === "operator" && (
        <>
          <div className="flex justify-end mb-4">
            <Button type="primary" onClick={handleAddOperator}>
              + Thêm nhân viên vận hành
            </Button>
          </div>
          <TableOperator
            operators={operatorsList}
            onViewDetail={handleViewDetailOperator}
            onEdit={handleEditOperator}
            onDelete={handleDeleteOperator}
          />
        </>
      )}

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của người dùng
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                {selectedUser.profileImageUrl ? (
                  <img
                    src={selectedUser.profileImageUrl}
                    alt={selectedUser.fullName}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold">
                    {selectedUser.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-600">Điện thoại</span>
                  <p className="font-medium">{selectedUser.phone || "---"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <p className="font-medium">
                    {selectedUser.isActive ? "Hoạt động" : "Không hoạt động"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Xác thực</span>
                  <p className="font-medium">
                    {selectedUser.isVerified ? "Xác thực" : "Chờ xác thực"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày sinh</span>
                  <p className="font-medium">
                    {selectedUser.dateOfBirth
                      ? new Date(selectedUser.dateOfBirth).toLocaleDateString(
                          "vi-VN",
                        )
                      : "---"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">Ngày tạo</span>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">
                    Cập nhật lần cuối
                  </span>
                  <p className="font-medium">
                    {new Date(selectedUser.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isStaffDetailDialogOpen}
        onOpenChange={setIsStaffDetailDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết nhân viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của nhân viên
            </DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                {selectedStaff.profileImageUrl ? (
                  <img
                    src={selectedStaff.profileImageUrl}
                    alt={selectedStaff.fullName}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold">
                    {selectedStaff.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedStaff.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedStaff.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-600">Mã nhân viên</span>
                  <p className="font-medium">
                    {selectedStaff.employeeCode || "---"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-medium">{selectedStaff.email}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Điện thoại</span>
                  <p className="font-medium">{selectedStaff.phone || "---"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <p className="font-medium">
                    {selectedStaff.isActive ? "Hoạt động" : "Không hoạt động"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Vai trò</span>
                  <p className="font-medium">
                    {selectedStaff.role == "staff" && "Nhân viên"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Loại nhân viên</span>
                  <p className="font-medium">
                    {selectedStaff.staffRole === "customer_service" &&
                      "Dịch vụ khách hàng"}
                    {selectedStaff.staffRole === "maintenance" && "Bảo trì"}
                    {selectedStaff.staffRole === "technician" &&
                      "Kỹ thuật viên"}
                    {!selectedStaff.staffRole && "---"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Ngày bắt đầu</span>
                  <p className="font-medium">
                    {selectedStaff.hireDate
                      ? new Date(selectedStaff.hireDate).toLocaleDateString(
                          "vi-VN",
                        )
                      : "---"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày tạo</span>
                  <p className="font-medium">
                    {new Date(selectedStaff.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                {selectedStaff.updatedAt && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">
                        Cập nhật lần cuối
                      </span>
                      <p className="font-medium">
                        {new Date(selectedStaff.updatedAt).toLocaleString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ModalDeleteUser
        user={selectedUser}
        open={showModalDeleteUser}
        onClose={() => setShowModalDeleteUser(false)}
      />

      <ModalEditUser
        user={selectedUser}
        open={showModalEditUser}
        onClose={() => setShowModalEditUser(false)}
      />

      <ModalEditStaff
        staff={selectedStaff}
        open={showModalEditStaff}
        onClose={() => setShowModalEditStaff(false)}
      />

      <ModalDeleteStaff
        staff={selectedStaff}
        open={showModalDeleteStaff}
        onClose={() => setShowModalDeleteStaff(false)}
      />

      <ModalAddStaff
        open={showModalAddStaff}
        onClose={() => setShowModalAddStaff(false)}
      />

      <Dialog
        open={isOperatorDetailDialogOpen}
        onOpenChange={setIsOperatorDetailDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết nhân viên vận hành</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của nhân viên vận hành
            </DialogDescription>
          </DialogHeader>

          {selectedOperator && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                {selectedOperator.profileImageUrl ? (
                  <img
                    src={selectedOperator.profileImageUrl}
                    alt={selectedOperator.fullName}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-xl font-semibold">
                    {selectedOperator.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedOperator.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedOperator.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-600">Mã nhân viên</span>
                  <p className="font-medium">
                    {selectedOperator.employeeCode || "---"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-medium">{selectedOperator.email}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Điện thoại</span>
                  <p className="font-medium">
                    {selectedOperator.phone || "---"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <p className="font-medium">
                    {selectedOperator.isActive
                      ? "Hoạt động"
                      : "Không hoạt động"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Vai trò</span>
                  <p className="font-medium">
                    {selectedOperator.role == "operator" &&
                      "Nhân viên vận hành"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ca làm việc</span>
                  <p className="font-medium">
                    {selectedOperator.operatorShift === "flexible" &&
                      "Ca linh hoạt"}
                    {selectedOperator.operatorShift === "morning" && "Ca sáng"}
                    {selectedOperator.operatorShift === "afternoon" &&
                      "Ca chiều"}
                    {selectedOperator.operatorShift === "night" && "Ca đêm"}
                    {!selectedOperator.operatorShift && "---"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Ngày tạo</span>
                  <p className="font-medium">
                    {new Date(selectedOperator.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>

                {selectedOperator.updatedAt && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">
                        Cập nhật lần cuối
                      </span>
                      <p className="font-medium">
                        {new Date(selectedOperator.updatedAt).toLocaleString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ModalEditOperator
        operator={selectedOperator}
        open={showModalEditOperator}
        onClose={() => setShowModalEditOperator(false)}
      />

      <ModalDeleteOperator
        operator={selectedOperator}
        open={showModalDeleteOperator}
        onClose={() => setShowModalDeleteOperator(false)}
      />

      <ModalAddOperator
        open={showModalAddOperator}
        onClose={() => setShowModalAddOperator(false)}
      />
    </div>
  );
}
