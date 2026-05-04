import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Alert, Typography } from "antd";
import { useAuthStore } from "../store/authStore";
import api from "../lib/axios";

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const { data } = await api.post("/auth/login", values);
      if (data.role !== "ADMIN") {
        form.setFields([
          { name: "password", errors: ["Tài khoản không có quyền admin"] },
        ]);
        return;
      }
      login(data);
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Đăng nhập thất bại";
      form.setFields([
        { name: "password", errors: [Array.isArray(msg) ? msg[0] : msg] },
      ]);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          Admin Dashboard
        </Title>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input size="large" placeholder="admin@shopai.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
