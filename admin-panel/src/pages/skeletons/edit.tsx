import React, { useState, useEffect } from "react";
import {
  Form, Input, InputNumber, Select, Switch, Button, Card, Drawer, Checkbox,
  Typography, Row, Col, Divider, Tag, Badge, Tooltip, Popconfirm, Spin,
  message, Empty, Alert, Space, Modal,
} from "antd";
import {
  SaveOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined,
  EditOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CheckCircleOutlined, PauseCircleOutlined, WarningOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ─── Constants ────────────────────────────────────────────────────────────────

const OCCASION_OPTIONS = [
  { value: "WEDDING",    label: "💍  Wedding" },
  { value: "CORPORATE",  label: "💼  Corporate" },
  { value: "BIRTHDAY",   label: "🎂  Birthday" },
  { value: "ENGAGEMENT", label: "💕  Engagement" },
  { value: "COASTAL",    label: "🦐  Coastal Feast" },
  { value: "CUSTOM",     label: "✨  Custom" },
];

const CATEGORY_OPTIONS = [
  { value: "WELCOME_DRINK",  label: "🥤  Welcome Drinks" },
  { value: "VEG_STARTER",    label: "🥗  Starters — Veg" },
  { value: "NONVEG_STARTER", label: "🍗  Starters — Non-Veg" },
  { value: "VEG_MAIN",       label: "🥘  Main Course — Veg" },
  { value: "NONVEG_MAIN",    label: "🍖  Main Course — Non-Veg" },
  { value: "DAL",            label: "🫕  Dal & Lentils" },
  { value: "BREAD",          label: "🍞  Breads & Tandoor" },
  { value: "RICE",           label: "🍚  Rice & Biryani" },
  { value: "DESSERT",        label: "🍮  Desserts & Sweets" },
];

const CATEGORY_ICONS: Record<string, string> = {
  WELCOME_DRINK:  "🥤",
  VEG_STARTER:    "🥗",
  NONVEG_STARTER: "🍗",
  VEG_MAIN:       "🥘",
  NONVEG_MAIN:    "🍖",
  DAL:            "🫕",
  BREAD:          "🍞",
  RICE:           "🍚",
  DESSERT:        "🍮",
};

const CUISINE_COLORS: Record<string, string> = {
  NORTH_INDIAN:   "orange",
  SOUTH_INDIAN:   "green",
  COASTAL:        "cyan",
  MUGHLAI:        "purple",
  MAHARASHTRIAN:  "geekblue",
  INDO_CHINESE:   "red",
  CONTINENTAL:    "blue",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SkeletonEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [metaForm] = Form.useForm();
  const [slotForm] = Form.useForm();

  // State
  const [skeleton, setSkeleton] = useState<any>(null);
  const [allDishes, setAllDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotDrawerOpen, setSlotDrawerOpen] = useState(false);
  const [dishDrawerOpen, setDishDrawerOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [activeSlot, setActiveSlot] = useState<any>(null);   // slot whose dishes we're editing
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [dishFilter, setDishFilter] = useState("");
  const [savingDishes, setSavingDishes] = useState(false);

  // Load skeleton + all dishes
  useEffect(() => {
    const load = async () => {
      try {
        const [skelRes, dishRes] = await Promise.all([
          api.get(`/skeletons/${id}`),
          api.get("/dishes"),
        ]);
        setSkeleton(skelRes.data);
        setAllDishes(dishRes.data);
        metaForm.setFieldsValue({
          name:         skelRes.data.name,
          occasion:     skelRes.data.occasion,
          description:  skelRes.data.description,
          basePrice:    skelRes.data.basePrice,
          minHeadcount: skelRes.data.minHeadcount,
          maxHeadcount: skelRes.data.maxHeadcount,
          isActive:     skelRes.data.isActive,
        });
      } catch {
        message.error("Failed to load skeleton");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const reload = async () => {
    const res = await api.get(`/skeletons/${id}`);
    setSkeleton(res.data);
  };

  // ── Save metadata ──────────────────────────────────────────────────────────
  const saveMeta = async () => {
    try {
      const values = await metaForm.validateFields();
      setSaving(true);
      await api.patch(`/skeletons/${id}`, values);
      await reload();
      message.success("Skeleton details saved");
    } catch (e: any) {
      if (e?.errorFields) return; // form validation error, ignore
      message.error("Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────────────────
  const toggleActive = async () => {
    await api.patch(`/skeletons/${id}/toggle`);
    await reload();
    message.success("Status updated");
  };

  // ── Slot: open drawer ──────────────────────────────────────────────────────
  const openAddSlot = () => {
    setEditingSlot(null);
    slotForm.resetFields();
    setSlotDrawerOpen(true);
  };

  const openEditSlot = (slot: any) => {
    setEditingSlot(slot);
    slotForm.setFieldsValue({
      category:   slot.category,
      label:      slot.label,
      minChoices: slot.minChoices,
      maxChoices: slot.maxChoices,
      isRequired: slot.isRequired,
    });
    setSlotDrawerOpen(true);
  };

  const saveSlot = async () => {
    try {
      const values = await slotForm.validateFields();
      if (values.minChoices > values.maxChoices) {
        message.error("Min choices cannot exceed max choices");
        return;
      }
      if (editingSlot) {
        await api.patch(`/skeletons/${id}/slots/${editingSlot.id}`, values);
        message.success("Slot updated");
      } else {
        await api.post(`/skeletons/${id}/slots`, values);
        message.success("Slot added");
      }
      setSlotDrawerOpen(false);
      await reload();
    } catch (e: any) {
      if (!e?.errorFields) message.error("Failed to save slot");
    }
  };

  const deleteSlot = async (slotId: string) => {
    await api.delete(`/skeletons/${id}/slots/${slotId}`);
    message.success("Slot removed");
    await reload();
  };

  const moveSlot = async (slotId: string, direction: "up" | "down") => {
    const slots = [...(skeleton?.slots ?? [])].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    const idx = slots.findIndex((s: any) => s.id === slotId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= slots.length) return;

    const ordered = slots.map((s: any) => s.id);
    [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx], ordered[idx]];

    await api.patch(`/skeletons/${id}/slots/reorder`, { orderedSlotIds: ordered });
    await reload();
  };

  // ── Dish assignment ────────────────────────────────────────────────────────
  const openDishPicker = (slot: any) => {
    setActiveSlot(slot);
    setSelectedDishIds(slot.dishes?.map((sd: any) => sd.dishId) ?? []);
    setDishFilter("");
    setDishDrawerOpen(true);
  };

  const saveDishAssignment = async () => {
    if (!activeSlot) return;
    if (selectedDishIds.length < activeSlot.minChoices) {
      message.warning(`Please assign at least ${activeSlot.minChoices} dishes (minimum choices for this slot)`);
      return;
    }
    setSavingDishes(true);
    try {
      await api.patch(`/skeletons/${id}/slots/${activeSlot.id}/dishes`, { dishIds: selectedDishIds });
      message.success("Dishes assigned");
      setDishDrawerOpen(false);
      await reload();
    } catch {
      message.error("Failed to assign dishes");
    } finally {
      setSavingDishes(false);
    }
  };

  // Dishes filtered by active slot's category, then name search
  const filteredDishes = allDishes.filter((d: any) => {
    if (!activeSlot) return false;
    const matchCat = d.category === activeSlot.category;
    const matchSearch = !dishFilter ||
      d.name.toLowerCase().includes(dishFilter.toLowerCase()) ||
      (d.hindiName || "").toLowerCase().includes(dishFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
      <Spin size="large" tip="Loading skeleton editor..." />
    </div>
  );

  if (!skeleton) return <Alert type="error" message="Skeleton not found" />;

  const sortedSlots = [...(skeleton.slots ?? [])].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const allSlotsHaveDishes = sortedSlots.every((s: any) => s.dishes?.length >= s.minChoices);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/skeletons")} />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>{skeleton.name}</Title>
          <Space>
            <Tag color={skeleton.isActive ? "green" : "default"}>
              {skeleton.isActive ? "✓ Active" : "Draft"}
            </Tag>
            <Tag>{skeleton.occasion}</Tag>
            <Text type="secondary">₹{skeleton.basePrice}/head</Text>
          </Space>
        </div>
        <Tooltip title={skeleton.isActive ? "Deactivate (hide from customers)" : "Activate (show to customers)"}>
          <Button
            icon={skeleton.isActive ? <PauseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={toggleActive}
            type={skeleton.isActive ? "default" : "primary"}
            style={skeleton.isActive ? {} : { background: "#22c55e", borderColor: "#22c55e" }}
          >
            {skeleton.isActive ? "Deactivate" : "Activate"}
          </Button>
        </Tooltip>
      </div>

      {/* ── Readiness Banner ── */}
      {!skeleton.isActive && (
        allSlotsHaveDishes && sortedSlots.length > 0 ? (
          <Alert
            type="success"
            icon={<CheckCircleOutlined />}
            message="Ready to activate! All slots have dishes assigned."
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
            action={
              <Button size="small" type="primary" style={{ background: "#22c55e", borderColor: "#22c55e" }} onClick={toggleActive}>
                Activate Now
              </Button>
            }
          />
        ) : (
          <Alert
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            message={
              sortedSlots.length === 0
                ? "Add at least one category slot before activating."
                : "Some slots have no dishes assigned — customers won't be able to book this skeleton yet."
            }
            style={{ marginBottom: 20, borderRadius: 10 }}
          />
        )
      )}

      {/* ═══════════════════════════════════════════════════════════
          PANEL 1 — Skeleton Metadata
      ═══════════════════════════════════════════════════════════ */}
      <Card
        title={<Text strong style={{ fontSize: 16 }}>📋 Skeleton Details</Text>}
        style={{ borderRadius: 16, marginBottom: 24, border: "1px solid #f3f4f6" }}
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveMeta}
            loading={saving}
            style={{ background: "#f97316", borderColor: "#f97316" }}
          >
            Save Details
          </Button>
        }
      >
        <Form form={metaForm} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="Skeleton Name"
                name="name"
                rules={[{ required: true }]}
              >
                <Input size="large" placeholder="e.g. Royal Wedding Spread" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Occasion Type"
                name="occasion"
                rules={[{ required: true }]}
              >
                <Select size="large" options={OCCASION_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description (shown to customers)" name="description">
            <TextArea rows={2} placeholder="Briefly describe this package..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Base Price / Head (₹)" name="basePrice" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} size="large" prefix="₹" min={0} step={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Min Guests" name="minHeadcount" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} size="large" min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Max Guests (optional)" name="maxHeadcount">
                <InputNumber style={{ width: "100%" }} size="large" min={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          PANEL 2 — Slot Manager
      ═══════════════════════════════════════════════════════════ */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text strong style={{ fontSize: 16 }}>🗂️ Category Slots</Text>
            <Badge count={sortedSlots.length} style={{ backgroundColor: "#f97316" }} />
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddSlot}
            style={{ background: "#1f2937", borderColor: "#1f2937" }}
          >
            Add Slot
          </Button>
        }
        style={{ borderRadius: 16, border: "1px solid #f3f4f6" }}
      >
        {sortedSlots.length === 0 ? (
          <Empty
            description="No slots yet. Add a category slot to start building this skeleton."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="dashed" icon={<PlusOutlined />} onClick={openAddSlot}>
              Add First Slot
            </Button>
          </Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedSlots.map((slot: any, idx: number) => {
              const dishCount = slot.dishes?.length ?? 0;
              const hasEnough = dishCount >= slot.minChoices;
              return (
                <div
                  key={slot.id}
                  style={{
                    border: `1.5px solid ${hasEnough ? "#e5e7eb" : "#fca5a5"}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    background: hasEnough ? "#fafafa" : "#fff5f5",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* Reorder buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={idx === 0}
                      onClick={() => moveSlot(slot.id, "up")}
                      style={{ width: 28, height: 24, padding: 0 }}
                    />
                    <Button
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={idx === sortedSlots.length - 1}
                      onClick={() => moveSlot(slot.id, "down")}
                      style={{ width: 28, height: 24, padding: 0 }}
                    />
                  </div>

                  {/* Category icon */}
                  <div style={{ fontSize: 28, lineHeight: 1 }}>
                    {CATEGORY_ICONS[slot.category] || "📋"}
                  </div>

                  {/* Slot info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Text strong style={{ fontSize: 15 }}>{slot.label}</Text>
                      {!slot.isRequired && (
                        <Tag color="blue" style={{ fontSize: 11 }}>Optional</Tag>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Choose {slot.minChoices}–{slot.maxChoices} dishes
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: hasEnough ? "#16a34a" : "#dc2626",
                          fontWeight: "bold",
                        }}
                      >
                        {dishCount} dish{dishCount !== 1 ? "es" : ""} available
                        {!hasEnough && ` (need at least ${slot.minChoices})`}
                      </Text>
                    </div>

                    {/* Dish preview chips */}
                    {dishCount > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {slot.dishes.slice(0, 6).map((sd: any) => (
                          <Tag
                            key={sd.dishId}
                            style={{
                              fontSize: 11,
                              borderRadius: 6,
                              background: sd.dish?.isNonVeg ? "#fef2f2" : "#f0fdf4",
                              border: `1px solid ${sd.dish?.isNonVeg ? "#fca5a5" : "#86efac"}`,
                              color: "#374151",
                              margin: 0,
                            }}
                          >
                            {sd.dish?.isNonVeg ? "🔴" : "🟢"} {sd.dish?.name}
                          </Tag>
                        ))}
                        {dishCount > 6 && (
                          <Tag style={{ fontSize: 11, borderRadius: 6 }}>+{dishCount - 6} more</Tag>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <Space>
                    <Button
                      icon={<span>🍽️</span>}
                      onClick={() => openDishPicker(slot)}
                      style={{
                        borderColor: hasEnough ? "#e5e7eb" : "#f97316",
                        color: hasEnough ? "#374151" : "#f97316",
                        fontWeight: hasEnough ? "normal" : "bold",
                      }}
                    >
                      {dishCount === 0 ? "Assign Dishes" : "Edit Dishes"}
                    </Button>
                    <Tooltip title="Edit slot settings">
                      <Button icon={<EditOutlined />} onClick={() => openEditSlot(slot)} />
                    </Tooltip>
                    <Popconfirm
                      title="Remove this slot?"
                      description="All dish assignments for this slot will also be removed."
                      onConfirm={() => deleteSlot(slot.id)}
                      okText="Remove"
                      okType="danger"
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER — Add / Edit Slot
      ═══════════════════════════════════════════════════════════ */}
      <Drawer
        title={editingSlot ? "Edit Slot" : "Add Category Slot"}
        open={slotDrawerOpen}
        onClose={() => setSlotDrawerOpen(false)}
        width={440}
        footer={
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setSlotDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveSlot}
              style={{ background: "#f97316", borderColor: "#f97316" }}
            >
              {editingSlot ? "Update Slot" : "Add Slot"}
            </Button>
          </Space>
        }
      >
        <Form form={slotForm} layout="vertical">
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Select a category" }]}
          >
            <Select
              size="large"
              placeholder="What type of dishes go in this slot?"
              options={CATEGORY_OPTIONS}
              onChange={(val) => {
                // Auto-fill label if empty
                const opt = CATEGORY_OPTIONS.find((o) => o.value === val);
                if (opt && !slotForm.getFieldValue("label")) {
                  slotForm.setFieldValue("label", opt.label.split("  ")[1]);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="Slot Label (shown to customer)"
            name="label"
            rules={[{ required: true, message: "Add a label" }]}
          >
            <Input
              size="large"
              placeholder="e.g. Choose Your Starters, Select Dal"
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Min Dishes to Pick"
                name="minChoices"
                rules={[{ required: true }]}
                initialValue={2}
              >
                <InputNumber style={{ width: "100%" }} size="large" min={1} max={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Max Dishes to Pick"
                name="maxChoices"
                rules={[{ required: true }]}
                initialValue={3}
              >
                <InputNumber style={{ width: "100%" }} size="large" min={1} max={20} />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: -12, marginBottom: 16 }}>
            Customer must pick between min and max dishes for this slot.
          </Text>

          <Form.Item
            label="Required?"
            name="isRequired"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Required" unCheckedChildren="Optional" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Optional slots can be skipped by the customer during booking.
          </Text>
        </Form>
      </Drawer>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER — Dish Picker
      ═══════════════════════════════════════════════════════════ */}
      <Drawer
        title={
          activeSlot && (
            <div>
              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                {CATEGORY_ICONS[activeSlot.category]} {activeSlot.label}
              </div>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: "normal" }}>
                Customer will pick {activeSlot.minChoices}–{activeSlot.maxChoices} dishes from this list
              </Text>
            </div>
          )
        }
        open={dishDrawerOpen}
        onClose={() => setDishDrawerOpen(false)}
        width={520}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {selectedDishIds.length} selected
              {activeSlot && selectedDishIds.length < activeSlot.minChoices && (
                <Text type="danger"> (need at least {activeSlot.minChoices})</Text>
              )}
            </Text>
            <Space>
              <Button onClick={() => setDishDrawerOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                loading={savingDishes}
                onClick={saveDishAssignment}
                style={{ background: "#f97316", borderColor: "#f97316" }}
                disabled={activeSlot && selectedDishIds.length < activeSlot.minChoices}
              >
                Save Dishes
              </Button>
            </Space>
          </div>
        }
      >
        {/* Search */}
        <Input
          placeholder="Search by name or Hindi name..."
          value={dishFilter}
          onChange={(e) => setDishFilter(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />

        {/* Select all / none */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {filteredDishes.length} dish{filteredDishes.length !== 1 ? "es" : ""} in this category
          </Text>
          <Space size={4}>
            <Button size="small" type="link" onClick={() => setSelectedDishIds(filteredDishes.map((d) => d.id))}>
              Select All
            </Button>
            <Button size="small" type="link" danger onClick={() => setSelectedDishIds([])}>
              Clear
            </Button>
          </Space>
        </div>

        {filteredDishes.length === 0 ? (
          <Empty
            description={
              dishFilter
                ? `No dishes match "${dishFilter}"`
                : "No dishes found for this category. Add dishes to the Dish Library first."
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredDishes.map((dish: any) => {
              const isSelected = selectedDishIds.includes(dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => {
                    setSelectedDishIds((prev) =>
                      isSelected ? prev.filter((did) => did !== dish.id) : [...prev, dish.id]
                    );
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: `2px solid ${isSelected ? "#f97316" : "#e5e7eb"}`,
                    background: isSelected ? "#fff7ed" : dish.isActive ? "#fafafa" : "#f9f9f9",
                    opacity: dish.isActive ? 1 : 0.55,
                    transition: "all 0.15s",
                  }}
                >
                  <Checkbox checked={isSelected} onChange={() => {}} />
                  <span style={{ fontSize: 18 }}>{dish.isNonVeg ? "🔴" : "🟢"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Text strong style={{ fontSize: 14 }}>{dish.name}</Text>
                      {dish.isPremium && <Tag color="gold" style={{ fontSize: 11 }}>★ Premium</Tag>}
                      {!dish.isActive && <Tag color="default" style={{ fontSize: 11 }}>Inactive</Tag>}
                    </div>
                    {dish.hindiName && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{dish.hindiName}</Text>
                    )}
                    {dish.cuisine && (
                      <Tag
                        color={CUISINE_COLORS[dish.cuisine] || "default"}
                        style={{ fontSize: 11, marginTop: 4, marginLeft: 0 }}
                      >
                        {dish.cuisine.replace("_", " ")}
                      </Tag>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </div>
  );
};
