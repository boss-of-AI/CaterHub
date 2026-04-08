import React from "react";
import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Typography, Space, Tag } from "antd";

const { Text } = Typography;

export const CatererList = () => {
  const { tableProps } = useTable({
    resource: "caterers",
  });

  return (
    <List title="Mumbai Vendor Management">
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title="UID"
          render={(value: string) => (
            <Text copyable={{ text: value }} code>
              {value.substring(0, 8)}
            </Text>
          )}
        />
        <Table.Column
          dataIndex="name"
          title="Caterer Name"
          render={(value) => <Text strong>{value}</Text>}
        />
        <Table.Column
          dataIndex="username"
          title="Portal Username"
          render={(value) => <Tag color="orange">{value}</Tag>}
        />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="city" title="City" />
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
