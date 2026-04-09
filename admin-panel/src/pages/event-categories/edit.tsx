import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch } from "antd";

export const EventCategoryEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="System Name"
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Display Name"
          name="label"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Icon (Emoji)"
          name="icon"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Image URL"
          name="imageUrl"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Sort Order"
          name="sortOrder"
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="Active Status"
          name="isActive"
          valuePropName="checked"
          help="If inactive, the category will be hidden from the customer site"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
