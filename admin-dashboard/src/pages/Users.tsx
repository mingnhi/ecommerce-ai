import { Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import api from "../lib/axios";
import dayjs from "dayjs";

const { Title } = Typography;

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
}

export default function UsersPage() {
  const { data, isLoading } = useQuery<{ data: User[]; total: number }>({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/users?limit=200")).data,
  });

  const columns: ColumnsType<User> = [
    { title: "Họ tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (r) => <Tag color={r === "ADMIN" ? "purple" : "blue"}>{r}</Tag>,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        Quản lý người dùng
      </Title>
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
