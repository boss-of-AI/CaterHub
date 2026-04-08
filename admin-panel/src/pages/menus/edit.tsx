import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";

export const MenuEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: catererSelectProps } = useSelect({
    resource: "caterers",
    optionLabel: "name",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Menu Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Caterer" name="catererId" rules={[{ required: true }]}>
          <Select {...catererSelectProps} />
        </Form.Item>

        <Form.Item
          label="Menu Items"
          name="items"
          rules={[
            { required: true, message: "Please add at least one item" },
            {
              validator: (_, value) => {
                if (value && value.length > 30) return Promise.reject("Max 30 items");
                if (value && value.some((i: string) => i.length > 25)) return Promise.reject("Max 25 chars per item");
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select mode="tags" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="Price Per Head" name="pricePerHead" rules={[{ required: true }]}>
          <InputNumber prefix="₹" style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Minimum Headcount" name="minHeadcount" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item label="Non-Veg" name="isNonVeg" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};