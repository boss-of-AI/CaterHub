import React, { useState } from "react";
import {
  Card, Row, Col, Tag, Button, Switch, Tooltip, Popconfirm,
  Typography, Badge, Empty, Spin, message, Space,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  CheckCircleOutlined, PauseCircleOutlined,
} from "@ant-design/icons";
import { useList, useDelete, useCustomMutation } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const OCCASION_COLORS: Record<string, string> = {
  WEDDING:     "#f97316",
  CORPORATE:   "#3b82f6",
  BIRTHDAY:    "#ec4899",
  ENGAGEMENT:  "#a855f7",
  COASTAL:     "#06b6d4",
  CUSTOM:      "#6b7280",
};

const OCCASION_EMOJIS: Record<string, string> = {
  WEDDING:     "💍",
  CORPORATE:   "💼",
  BIRTHDAY:    "🎂",
  ENGAGEMENT:  "#💕",
  COASTAL:     "🦐",
  CUSTOM:      "✨",
};

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

export const SkeletonList = () => {
  const navigate = useNavigate();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { query, result } = useList({
    resource: "skeletons",
    pagination: { mode: "off" },
  });

  const { isLoading, refetch } = query;

  const { mutate: deleteSkeleton } = useDelete();
  const { mutate: toggleActive } = useCustomMutation();
  const { mutate: cloneSkeleton } = useCustomMutation();

  const skeletons = (result?.data as any[]) ?? [];

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    toggleActive(
      { url: `/skeletons/${id}/toggle`, method: "patch", values: {} },
      {
        onSuccess: () => { message.success("Status updated"); refetch(); setTogglingId(null); },
        onError: () => { message.error("Failed to update status"); setTogglingId(null); },
      }
    );
  };

  const handleClone = (id: string, name: string) => {
    cloneSkeleton(
      { url: `/skeletons/${id}/clone`, method: "post", values: {} },
      {
        onSuccess: () => { message.success(`"${name}" cloned successfully`); refetch(); },
        onError: () => message.error("Failed to clone skeleton"),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteSkeleton(
      { resource: "skeletons", id },
      { onSuccess: () => { message.success("Skeleton deleted"); refetch(); } }
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spin size="large" tip="Loading skeletons..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>Menu Skeleton Templates</Title>
          <Text type="secondary">
            {skeletons.length} template{skeletons.length !== 1 ? "s" : ""} •{" "}
            {skeletons.filter((s: any) => s.isActive).length} active
          </Text>
        </div>
        <Space>
          <Button onClick={() => navigate("/dishes")} icon={<span>🍽️</span>}>
            Manage Dish Library
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/skeletons/create")}
            style={{ background: "#f97316", borderColor: "#f97316" }}
          >
            New Skeleton
          </Button>
        </Space>
      </div>

      {skeletons.length === 0 ? (
        <Empty
          description="No skeletons yet. Create your first menu template."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/skeletons/create")}
            style={{ background: "#f97316", borderColor: "#f97316" }}
          >
            Create First Skeleton
          </Button>
        </Empty>
      ) : (
        <Row gutter={[20, 20]}>
          {skeletons.map((skeleton: any) => (
            <Col key={skeleton.id} xs={24} sm={24} md={12} xl={8}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: `2px solid ${skeleton.isActive ? OCCASION_COLORS[skeleton.occasion] + "33" : "#f0f0f0"}`,
                  opacity: skeleton.isActive ? 1 : 0.75,
                  transition: "all 0.2s",
                }}
                bodyStyle={{ padding: "20px" }}
              >
                {/* Top row: Occasion badge + Active toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <Tag
                    color={OCCASION_COLORS[skeleton.occasion]}
                    style={{ borderRadius: "8px", fontWeight: "bold", fontSize: "12px", padding: "2px 10px" }}
                  >
                    {OCCASION_EMOJIS[skeleton.occasion]} {skeleton.occasion}
                  </Tag>
                  <Tooltip title={skeleton.isActive ? "Click to deactivate" : "Click to activate"}>
                    <Switch
                      size="small"
                      checked={skeleton.isActive}
                      loading={togglingId === skeleton.id}
                      onChange={() => handleToggle(skeleton.id)}
                      checkedChildren={<CheckCircleOutlined />}
                      unCheckedChildren={<PauseCircleOutlined />}
                    />
                  </Tooltip>
                </div>

                {/* Name */}
                <Title level={4} style={{ margin: "0 0 4px 0", color: "#1f2937" }}>
                  {skeleton.name}
                </Title>

                {/* Description */}
                {skeleton.description && (
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ fontSize: "13px", marginBottom: "12px" }}
                  >
                    {skeleton.description}
                  </Paragraph>
                )}

                {/* Pricing & Headcount */}
                <div style={{
                  display: "flex", gap: "8px", marginBottom: "16px",
                  background: "#fafafa", borderRadius: "8px", padding: "10px 12px"
                }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase" }}>Base Price</div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#f97316" }}>
                      ₹{skeleton.basePrice}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>per head</div>
                  </div>
                  <div style={{ width: "1px", background: "#e5e7eb" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase" }}>Headcount</div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#374151", marginTop: "2px" }}>
                      {skeleton.minHeadcount}
                      {skeleton.maxHeadcount ? `–${skeleton.maxHeadcount}` : "+"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>guests</div>
                  </div>
                  <div style={{ width: "1px", background: "#e5e7eb" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase" }}>Orders</div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#374151", marginTop: "2px" }}>
                      {skeleton._count?.orders ?? 0}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>total</div>
                  </div>
                </div>

                {/* Slot Summary */}
                {skeleton.slots?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <Text type="secondary" style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>
                      {skeleton.slots.length} Categories
                    </Text>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                      {skeleton.slots.map((slot: any) => (
                        <Tooltip key={slot.id} title={`${slot.label}: choose ${slot.minChoices}–${slot.maxChoices} dishes (${slot.dishes?.length ?? 0} available)`}>
                          <Tag
                            style={{
                              borderRadius: "6px", cursor: "default", fontSize: "11px",
                              background: slot.dishes?.length > 0 ? "#f0fdf4" : "#fef2f2",
                              border: slot.dishes?.length > 0 ? "1px solid #86efac" : "1px solid #fca5a5",
                              color: "#374151",
                            }}
                          >
                            {CATEGORY_ICONS[slot.category] || "📋"} {slot.label}
                            <Badge
                              count={slot.dishes?.length ?? 0}
                              style={{
                                marginLeft: "4px",
                                backgroundColor: slot.dishes?.length > 0 ? "#22c55e" : "#ef4444",
                                fontSize: "10px",
                              }}
                            />
                          </Tag>
                        </Tooltip>
                      ))}
                    </div>
                    {skeleton.slots.some((s: any) => !s.dishes?.length) && (
                      <Text type="danger" style={{ fontSize: "11px" }}>
                        ⚠️ Some slots have no dishes assigned yet
                      </Text>
                    )}
                  </div>
                )}

                {skeleton.slots?.length === 0 && (
                  <div style={{
                    background: "#fff7ed", border: "1px dashed #fed7aa",
                    borderRadius: "8px", padding: "10px", marginBottom: "16px", textAlign: "center"
                  }}>
                    <Text type="warning" style={{ fontSize: "12px" }}>
                      No slots yet — click Edit to add category slots
                    </Text>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/skeletons/edit/${skeleton.id}`)}
                    style={{ flex: 1, background: "#1f2937", borderColor: "#1f2937" }}
                  >
                    Edit & Manage
                  </Button>
                  <Tooltip title="Clone this skeleton">
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => handleClone(skeleton.id, skeleton.name)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Delete this skeleton?"
                    description="Orders using this skeleton will be unaffected, but it won't be available for new bookings."
                    onConfirm={() => handleDelete(skeleton.id)}
                    okText="Delete"
                    okType="danger"
                  >
                    <Tooltip title="Delete skeleton">
                      <Button danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
