import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export const CatererEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Caterer Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Username" name="username" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>

        <Form.Item label="Contact Phone" name="phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="City" name="city" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Address" name="address" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Active Status" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Edit>
  );
};