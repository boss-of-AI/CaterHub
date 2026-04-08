import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker } from "antd";

// 1. Define the Menu interface so TS knows about pricePerHead
interface IMenu {
  id: string;
  name: string;
  pricePerHead: number;
}

export const OrderCreate = () => {
  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "orders",
    redirect: "list",
  });

  const [pricePerHead, setPricePerHead] = useState(0);
  const [count, setCount] = useState(0);

  // 2. Pass the IMenu type to useSelect
  const { selectProps: menuSelectProps, query: menuQuery } = useSelect<IMenu>({
    resource: "menus",
    optionLabel: "name",
  });

  const handleMenuChange = (value: string) => {
    // 3. Find the menu in the data array
    const selectedMenu = menuQuery.data?.data.find((m) => m.id === value);
    if (selectedMenu) {
      setPricePerHead(selectedMenu.pricePerHead);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values) => {
          onFinish({
            ...values,
            totalAmount: pricePerHead * count,
          });
        }}
      >
        <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="customerEmail" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
        
        <Form.Item label="Select Menu" name="menuId" rules={[{ required: true }]}>
          <Select 
            // 1. Only take the data and the loading state
            options={menuSelectProps.options}
            loading={menuSelectProps.loading}
            placeholder="Choose a menu"
            // 2. Explicitly handle the change
            onChange={(val: string) => {
            // This updates the Ant Design Form state
            formProps.form?.setFieldsValue({ menuId: val });
            // This updates your local price calculation logic
            handleMenuChange(val);
            }} 
            />
        </Form.Item>

        <Form.Item label="Headcount" name="headcount" rules={[{ required: true }]}>
          <InputNumber 
            min={1} 
            onChange={(val) => setCount(val || 0)} 
            style={{ width: "100%" }} 
          />
        </Form.Item>

        <Form.Item label="Event Date" name="eventDate" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <div style={{ padding: "15px", background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: "8px", marginTop: "20px" }}>
           <div style={{ fontSize: "14px", color: "#666" }}>Rate: ₹{pricePerHead} per head</div>
           <strong style={{ fontSize: "18px" }}>Total Amount: ₹{(pricePerHead * count).toLocaleString()}</strong>
        </div>
      </Form>
    </Create>
  );
};