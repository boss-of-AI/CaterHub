import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Switch } from "antd";
import { useUpdate } from "@refinedev/core";

export const EventCategoryList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { mutate } = useUpdate();

  const handleToggle = (id: string, checked: boolean) => {
    mutate({
      resource: "event-categories",
      id,
      values: {
        isActive: checked,
      },
    });
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={100} />
        <Table.Column dataIndex="icon" title="Icon" width={80} align="center" render={(k) => <span className="text-2xl">{k}</span>} />
        <Table.Column dataIndex="name" title="System Name" />
        <Table.Column dataIndex="label" title="Display Name" />
        <Table.Column 
          dataIndex="isActive" 
          title="Status" 
          render={(val, record: any) => (
            <Switch
              checked={val}
              onChange={(checked) => handleToggle(record.id, checked)}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          )} 
        />
        <Table.Column dataIndex="sortOrder" title="Sort Order" width={100} align="center" />
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
