import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";

export const MenuCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "menus",
    redirect: "list",
  });

  const { selectProps: catererSelectProps } = useSelect({
    resource: "caterers",
    optionLabel: "name",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Select Caterer"
          name="catererId"
          rules={[{ required: true, message: "Please select a caterer" }]}
        >
          <Select {...catererSelectProps} placeholder="Which caterer owns this menu?" />
        </Form.Item>

        <Form.Item label="Menu Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Premium Wedding Buffet" />
        </Form.Item>

        {/* NEW: Menu Items Array */}
        <Form.Item
          label="Menu Items (Max 30 items, 25 chars each)"
          name="items"
          rules={[
            { required: true, message: "Please add at least one item" },
            {
              validator: (_, value) => {
                if (value && value.length > 30) {
                  return Promise.reject("Maximum 30 items allowed");
                }
                if (value && value.some((item: string) => item.length > 25)) {
                  return Promise.reject("Each item must be under 25 characters");
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Type item and press Enter"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Describe the items in this menu..." />
        </Form.Item>

        <Form.Item label="Price Per Head" name="pricePerHead" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} prefix="₹" min={0} />
        </Form.Item>

        <Form.Item label="Minimum Headcount" name="minHeadcount" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item label="Is this Non-Veg?" name="isNonVeg" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};