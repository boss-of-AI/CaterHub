import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";

export const EventCategoryCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="System Name"
          name="name"
          rules={[{ required: true }]}
          help="Used internally (e.g. WEDDING)"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Display Name"
          name="label"
          rules={[{ required: true }]}
          help="Shown to customers (e.g. Royal Wedding)"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Icon (Emoji)"
          name="icon"
          help="Emoji icon to display on the customer home page"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Image URL"
          name="imageUrl"
          help="Cover image URL for the category banner"
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
          initialValue={0}
        >
          <InputNumber min={0} />
        </Form.Item>
      </Form>
    </Create>
  );
};
