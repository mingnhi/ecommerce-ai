import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import RevenueChart from "../components/charts/RevenueChart";

const { Title } = Typography;

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  revenueByDate: { date: string; revenue: number }[];
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  const cards = [
    {
      title: "Sản phẩm",
      value: stats?.totalProducts ?? 0,
      icon: <ShoppingOutlined />,
      color: "#1677ff",
    },
    {
      title: "Đơn hàng",
      value: stats?.totalOrders ?? 0,
      icon: <OrderedListOutlined />,
      color: "#52c41a",
    },
    {
      title: "Người dùng",
      value: stats?.totalUsers ?? 0,
      icon: <UserOutlined />,
      color: "#722ed1",
    },
    {
      title: "Doanh thu",
      value: stats?.totalRevenue ?? 0,
      icon: <DollarOutlined />,
      color: "#fa8c16",
      prefix: "₫",
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        {cards.map(({ title, value, icon, color, prefix }) => (
          <Col xs={24} sm={12} lg={6} key={title}>
            <Card loading={isLoading}>
              <Statistic
                title={title}
                value={value}
                prefix={
                  <span style={{ color, marginRight: 4 }}>
                    {icon}
                    {prefix && " " + prefix}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Doanh thu 30 ngày" style={{ marginTop: 24 }}>
        <RevenueChart data={stats?.revenueByDate ?? []} />
      </Card>
    </div>
  );
}
