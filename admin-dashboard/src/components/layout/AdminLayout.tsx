import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, theme } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/products", label: "Sản phẩm", icon: <ShoppingOutlined /> },
  { key: "/orders", label: "Đơn hàng", icon: <OrderedListOutlined /> },
  { key: "/users", label: "Người dùng", icon: <UserOutlined /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" breakpoint="lg" collapsedWidth={0}>
        <div
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          ShopAI Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.replace("/admin", "") || "/"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <span style={{ color: token.colorTextSecondary }}>{user?.email}</span>
          <Button
            icon={<LogoutOutlined />}
            type="text"
            danger
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
