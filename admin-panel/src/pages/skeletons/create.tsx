import React from "react";
import {
  Form, Input, InputNumber, Select, Switch, Button, Card,
  Typography, Row, Col, Divider,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useCreate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

const OCCASION_OPTIONS = [
  { value: "WEDDING",    label: "💍  Wedding" },
  { value: "CORPORATE",  label: "💼  Corporate" },
  { value: "BIRTHDAY",   label: "🎂  Birthday" },
  { value: "ENGAGEMENT", label: "💕  Engagement" },
  { value: "COASTAL",    label: "🦐  Coastal Feast" },
  { value: "CUSTOM",     label: "✨  Custom" },
];

export const SkeletonCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: createSkeleton, isLoading } = useCreate();

  const onFinish = (values: any) => {
    createSkeleton(
      { resource: "skeletons", values },
      {
        onSuccess: (data: any) => {
          const id = data?.data?.id;
          if (id) {
            navigate(`/skeletons/edit/${id}`);
          } else {
            navigate("/skeletons");
          }
        },
      }
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/skeletons")} />
        <div>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>New Menu Skeleton</Title>
          <Text type="secondary">After saving, you'll be taken to the editor to add category slots and assign dishes.</Text>
        </div>
      </div>

      <Card style={{ borderRadius: "16px", border: "1px solid #f3f4f6" }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: false }}>

          <Form.Item
            label={<Text strong>Skeleton Name</Text>}
            name="name"
            rules={[{ required: true, message: "Give this skeleton a clear name" }]}
          >
            <Input
              size="large"
              placeholder="e.g. Royal Wedding Spread, Corporate Lunch Standard"
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Occasion Type</Text>}
            name="occasion"
            rules={[{ required: true, message: "Select the occasion type" }]}
          >
            <Select size="large" placeholder="Select occasion" options={OCCASION_OPTIONS} />
          </Form.Item>

          <Form.Item
            label={<Text strong>Description</Text>}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Briefly describe this menu package (shown to customers)"
            />
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Base Price / Head (₹)</Text>}
                name="basePrice"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  prefix="₹"
                  min={0}
                  step={50}
                  placeholder="e.g. 850"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Min Guests</Text>}
                name="minHeadcount"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber size="large" style={{ width: "100%" }} min={1} placeholder="e.g. 50" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Max Guests (optional)</Text>}
                name="maxHeadcount"
              >
                <InputNumber size="large" style={{ width: "100%" }} min={1} placeholder="e.g. 1000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<Text strong>Start as Active?</Text>}
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Draft" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: -16, marginBottom: 16 }}>
            Leave as Draft while you add slots and dishes. Activate when ready for customers to book.
          </Text>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={isLoading}
            size="large"
            style={{ width: "100%", background: "#f97316", borderColor: "#f97316" }}
          >
            Save & Open Editor
          </Button>
        </Form>
      </Card>
    </div>
  );
};
