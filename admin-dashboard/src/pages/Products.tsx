import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Typography,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import api from "../lib/axios";

const { Title } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: { id: string; name: string };
}

export default function ProductsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Product[]; total: number }>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await api.get("/products?limit=100");
      return res.data;
    },
  });

  const { data: categories } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) =>
      editing
        ? api.patch(`/products/${editing.id}`, values)
        : api.post("/products", values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    form.setFieldsValue({ ...product, categoryId: product.category.id });
    setModalOpen(true);
  };

  const columns: ColumnsType<Product> = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (v) => v.toLocaleString("vi-VN") + " ₫",
    },
    { title: "Tồn kho", dataIndex: "stock", key: "stock" },
    { title: "Danh mục", dataIndex: ["category", "name"], key: "category" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => (
        <Tag color={v ? "green" : "red"}>{v ? "Hoạt động" : "Ẩn"}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá sản phẩm này?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3}>Quản lý sản phẩm</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(v) => saveMutation.mutate(v)}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá (₫)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true }]}
          >
            <Select
              options={categories?.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
