import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export const CatererCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "caterers",
    redirect: "list",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Caterer Name"
          name="name"
          rules={[{ required: true, message: "Please enter the caterer's business name" }]}
        >
          <Input placeholder="e.g. Royal Mumbai Catering" />
        </Form.Item>

        <Form.Item
          label="Username (for Login)"
          name="username"
          rules={[{ required: true, message: "Please provide a unique username" }]}
        >
          <Input placeholder="e.g. royal_catering_01" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password placeholder="Set a temporary password" />
        </Form.Item>

        <Form.Item label="Contact Phone" name="phone" rules={[{ required: true }]}>
          <Input placeholder="e.g. +91 98765 43210" />
        </Form.Item>

        <Form.Item label="City" name="city" rules={[{ required: true }]}>
          <Input placeholder="e.g. Mumbai" />
        </Form.Item>

        <Form.Item label="Business Address" name="address" rules={[{ required: true }]}>
          <Input.TextArea rows={2} placeholder="Full office/kitchen address" />
        </Form.Item>

        <Form.Item label="Active Status" name="isActive" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Create>
  );
};