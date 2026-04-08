import React from "react";
import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Tag, Typography, Space } from "antd";

const { Text } = Typography;

export const MenuList = () => {
  const { tableProps } = useTable({
    resource: "menus",
    meta: {
      populate: ["caterer"],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title="UID"
          render={(value: string) => (
            <Text copyable={{ text: value }}>{value.substring(0, 8)}...</Text>
          )}
        />
        <Table.Column dataIndex="name" title="Menu Name" />
        <Table.Column dataIndex="description" title="Description" />

        {/* NEW: Menu Items Column */}
        <Table.Column
          dataIndex="items"
          title="Menu Items"
          render={(value: string[]) => (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '250px' }}>
              {value && value.length > 0 ? (
                value.map((item) => (
                  <Tag key={item} color="blue" style={{ margin: 0 }}>
                    {item}
                  </Tag>
                ))
              ) : (
                <Text type="secondary" style={{ fontSize: '12px' }}>No items</Text>
              )}
            </div>
          )}
        />

        <Table.Column
          dataIndex="pricePerHead"
          title="Price/Head"
          render={(val) => `₹${val}`}
        />

        {/* Added Minimum Headcount Column */}
        <Table.Column
          dataIndex="minHeadcount"
          title="Min Guests"
          render={(val) => `${val} pax`}
        />

        <Table.Column
          dataIndex="isNonVeg"
          title="Type"
          render={(val) => (
            <Tag color={val ? "volcano" : "green"}>{val ? "Non-Veg" : "Veg"}</Tag>
          )}
        />

        <Table.Column dataIndex={["caterer", "name"]} title="Caterer" />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};