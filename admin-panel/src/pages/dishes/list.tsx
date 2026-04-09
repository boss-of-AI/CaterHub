import React, { useState, useEffect } from "react";
import {
  Table, Button, Tag, Switch, Typography, Space, Input, Select,
  Modal, Form, Tooltip, Popconfirm, Badge, Card, message, Row, Col,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const { Title, Text } = Typography;

const CATEGORY_OPTIONS = [
  { value: "WELCOME_DRINK",  label: "🥤 Welcome Drinks" },
  { value: "VEG_STARTER",    label: "🥗 Starters — Veg" },
  { value: "NONVEG_STARTER", label: "🍗 Starters — Non-Veg" },
  { value: "VEG_MAIN",       label: "🥘 Main Course — Veg" },
  { value: "NONVEG_MAIN",    label: "🍖 Main Course — Non-Veg" },
  { value: "DAL",            label: "🫕 Dal & Lentils" },
  { value: "BREAD",          label: "🍞 Breads & Tandoor" },
  { value: "RICE",           label: "🍚 Rice & Biryani" },
  { value: "DESSERT",        label: "🍮 Desserts & Sweets" },
];

const CUISINE_OPTIONS = [
  { value: "NORTH_INDIAN",   label: "North Indian" },
  { value: "SOUTH_INDIAN",   label: "South Indian" },
  { value: "COASTAL",        label: "Coastal / Konkan" },
  { value: "MUGHLAI",        label: "Mughlai" },
  { value: "MAHARASHTRIAN",  label: "Maharashtrian" },
  { value: "INDO_CHINESE",   label: "Indo-Chinese" },
  { value: "CONTINENTAL",    label: "Continental" },
];

const CUISINE_COLORS: Record<string, string> = {
  NORTH_INDIAN:  "orange",
  SOUTH_INDIAN:  "green",
  COASTAL:       "cyan",
  MUGHLAI:       "purple",
  MAHARASHTRIAN: "geekblue",
  INDO_CHINESE:  "red",
  CONTINENTAL:   "blue",
};

const CATEGORY_LABEL: Record<string, string> = {
  WELCOME_DRINK:  "🥤 Welcome Drinks",
  VEG_STARTER:    "🥗 Veg Starters",
  NONVEG_STARTER: "🍗 Non-Veg Starters",
  VEG_MAIN:       "🥘 Veg Main",
  NONVEG_MAIN:    "🍖 Non-Veg Main",
  DAL:            "🫕 Dal",
  BREAD:          "🍞 Breads",
  RICE:           "🍚 Rice & Biryani",
  DESSERT:        "🍮 Desserts",
};

export const DishList = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterSearch, setFilterSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res = await api.get("/dishes");
    setDishes(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Modal open helpers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingDish(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (dish: any) => {
    setEditingDish(dish);
    form.setFieldsValue({
      name:        dish.name,
      hindiName:   dish.hindiName,
      category:    dish.category,
      cuisine:     dish.cuisine,
      description: dish.description,
      isNonVeg:    dish.isNonVeg,
      isPremium:   dish.isPremium,
    });
    setModalOpen(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingDish) {
        await api.patch(`/dishes/${editingDish.id}`, values);
        message.success("Dish updated");
      } else {
        await api.post("/dishes", { ...values, isActive: true });
        message.success("Dish added to library");
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      if (!e?.errorFields) message.error("Failed to save dish");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ───────────────────────────────────────────────────────────
  const toggleActive = async (dish: any) => {
    await api.patch(`/dishes/${dish.id}/toggle`);
    setDishes((prev) =>
      prev.map((d) => d.id === dish.id ? { ...d, isActive: !d.isActive } : d)
    );
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteDish = async (id: string) => {
    await api.delete(`/dishes/${id}`);
    message.success("Dish removed");
    await load();
  };

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filtered = dishes.filter((d) => {
    const matchCat = !filterCategory || d.category === filterCategory;
    const matchSearch = !filterSearch ||
      d.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (d.hindiName || "").toLowerCase().includes(filterSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Stats per category
  const stats = dishes.reduce((acc: any, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {});

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Dish",
      key: "name",
      render: (_: any, d: any) => (
        <div>
          <Space>
            <span>{d.isNonVeg ? "🔴" : "🟢"}</span>
            <Text strong style={{ fontSize: 14 }}>{d.name}</Text>
            {d.isPremium && <Tag color="gold">★ Premium</Tag>}
            {!d.isActive && <Tag color="default">Inactive</Tag>}
          </Space>
          {d.hindiName && (
            <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>{d.hindiName}</div>
          )}
          {d.description && (
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{d.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (v: string) => (
        <Tag style={{ borderRadius: 6 }}>{CATEGORY_LABEL[v] || v}</Tag>
      ),
    },
    {
      title: "Cuisine",
      dataIndex: "cuisine",
      key: "cuisine",
      render: (v: string) =>
        v ? <Tag color={CUISINE_COLORS[v] || "default"}>{v.replace("_", " ")}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: "Active",
      key: "isActive",
      width: 80,
      render: (_: any, d: any) => (
        <Switch size="small" checked={d.isActive} onChange={() => toggleActive(d)} />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: any, d: any) => (
        <Space>
          <Tooltip title="Edit dish">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(d)} />
          </Tooltip>
          <Popconfirm
            title="Remove this dish?"
            description="It will be removed from all skeleton slots."
            onConfirm={() => deleteDish(d.id)}
            okText="Remove"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/skeletons")} />
        <div style={{ flex: 1 }}>
          <Title level={2} style={{ margin: 0 }}>🍽️ Dish Library</Title>
          <Text type="secondary">{dishes.length} total dishes</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          style={{ background: "#f97316", borderColor: "#f97316" }}
        >
          Add Dish
        </Button>
      </div>

      {/* Category stats */}
      <Row gutter={[8, 8]} style={{ marginBottom: 24 }}>
        {CATEGORY_OPTIONS.map((opt) => (
          <Col key={opt.value}>
            <Card
              hoverable
              size="small"
              onClick={() => setFilterCategory(filterCategory === opt.value ? undefined : opt.value)}
              style={{
                borderRadius: 10, cursor: "pointer", textAlign: "center",
                border: filterCategory === opt.value ? "2px solid #f97316" : "1px solid #e5e7eb",
                background: filterCategory === opt.value ? "#fff7ed" : "#fff",
                minWidth: 80,
              }}
              bodyStyle={{ padding: "8px 10px" }}
            >
              <div style={{ fontSize: 18 }}>{opt.label.split(" ")[0]}</div>
              <Badge count={stats[opt.value] || 0} style={{ backgroundColor: "#f97316" }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name or Hindi name..."
          prefix={<SearchOutlined />}
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
        <Select
          placeholder="Filter by category"
          options={[{ value: "", label: "All Categories" }, ...CATEGORY_OPTIONS]}
          value={filterCategory || ""}
          onChange={(v) => setFilterCategory(v || undefined)}
          style={{ width: 220 }}
          allowClear
        />
        {(filterSearch || filterCategory) && (
          <Button onClick={() => { setFilterSearch(""); setFilterCategory(undefined); }}>
            Clear filters
          </Button>
        )}
      </Space>
      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
        Showing {filtered.length} of {dishes.length} dishes
      </Text>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 30 }}
        size="small"
        rowClassName={(d) => d.isActive ? "" : "opacity-50"}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editingDish ? `Edit: ${editingDish.name}` : "Add New Dish"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={save}
        okText={editingDish ? "Save Changes" : "Add Dish"}
        confirmLoading={saving}
        okButtonProps={{ style: { background: "#f97316", borderColor: "#f97316" } }}
        width={540}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                label="Dish Name (English)"
                name="name"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="e.g. Paneer Tikka" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="Hindi / Marathi Name" name="hindiName">
                <Input placeholder="e.g. पनीर टिक्का" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true }]}
              >
                <Select options={CATEGORY_OPTIONS} placeholder="Select category" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cuisine" name="cuisine">
                <Select options={CUISINE_OPTIONS} placeholder="Select cuisine" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Short Description" name="description">
            <Input.TextArea rows={2} placeholder="e.g. Char-grilled marinated cottage cheese, best served hot" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Non-Vegetarian?" name="isNonVeg" valuePropName="checked">
                <Switch checkedChildren="🔴 Non-Veg" unCheckedChildren="🟢 Veg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Premium (adds surcharge)?" name="isPremium" valuePropName="checked">
                <Switch checkedChildren="★ Premium" unCheckedChildren="Standard" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
