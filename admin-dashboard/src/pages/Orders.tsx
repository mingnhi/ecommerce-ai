import { useState } from "react";
import { Table, Select, Tag, Button, Space, Typography } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import api from "../lib/axios";
import dayjs from "dayjs";

const { Title } = Typography;

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  user: { name: string; email: string };
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "default",
  CONFIRMED: "blue",
  SHIPPING: "orange",
  DELIVERED: "green",
  CANCELLED: "red",
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
};

const allStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Order[]; total: number }>({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      return (await api.get(`/orders?${params}`)).data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (v) => v.slice(0, 8).toUpperCase(),
    },
    {
      title: "Khách hàng",
      key: "user",
      render: (_, r) => (
        <div>
          <div>{r.user.name}</div>
          <div style={{ color: "#888", fontSize: 12 }}>{r.user.email}</div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus, record) => (
        <Select
          value={status}
          size="small"
          style={{ width: 140 }}
          onChange={(newStatus) =>
            updateStatus.mutate({ id: record.id, status: newStatus })
          }
          options={allStatuses.map((s) => ({
            value: s,
            label: statusLabels[s],
          }))}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3}>Quản lý đơn hàng</Title>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          options={[
            { value: "ALL", label: "Tất cả" },
            ...allStatuses.map((s) => ({ value: s, label: statusLabels[s] })),
          ]}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
