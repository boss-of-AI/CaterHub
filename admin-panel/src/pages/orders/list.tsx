import React, { useState, useEffect } from "react";
import { List, useTable } from "@refinedev/antd";
import { Table, Space, Button, Typography, Tag } from "antd";
import { SendOutlined, CloseCircleOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useDelete, HttpError } from "@refinedev/core";
import BroadcastModal from "../../components/BroadcastModal";
import api from "../../api/axios";

const { Text } = Typography;

export const OrderList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [caterers, setCaterers] = useState([]);

  useEffect(() => {
    api.get("/caterers").then((res) => setCaterers(res.data));
  }, []);

  const { tableProps, ...tableResult } = useTable<any, HttpError>({
    resource: "orders",
    filters: {
      permanent: [{ field: "status", operator: "eq", value: "PENDING" }],
    },
    meta: {
      populate: ["customer", "menu"],
    },
  });

  const refetch = () => {
    const result = tableResult as any;
    const f = result.tableQueryResult?.refetch || result.queryResult?.refetch;
    if (f) f();
    else window.location.reload();
  };

  const { mutate: deleteOrder } = useDelete();

  return (
    <List title="Incoming Booking Requests">
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title="UID"
          render={(v: string) => <Text code copyable={{ text: v }}>{v.substring(0, 6)}</Text>}
        />

        {/* Stacked Customer Info */}
        <Table.Column
          title="Customer"
          render={(_, r: any) => (
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{r.customer?.name || "N/A"}</div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>📞 {r.customer?.phoneNumber}</div>
              <div style={{ fontSize: "12px", color: "#555" }}>✉️ {r.customer?.email || "No email"}</div>
            </div>
          )}
        />

        {/* Enhanced Event Info with Time */}
        <Table.Column
          title="Event Details"
          render={(_, r: any) => (
            <div>
              <div style={{ fontWeight: "bold", color: "#1890ff" }}>{r.eventType || "Event"}</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                <EnvironmentOutlined /> {r.eventLocation}
              </div>
              <div style={{ fontSize: "12px", color: "#d4380d", marginTop: "2px" }}>
                <ClockCircleOutlined /> {r.eventDate ? new Date(r.eventDate).toLocaleString("en-IN", {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : "TBD"}
              </div>
              <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>👥 {r.headcount} Guests</div>
            </div>
          )}
        />

        {/* Stacked Menu Info */}
        <Table.Column
          title="Requested Menu"
          render={(_, r: any) => (
            <div style={{ maxWidth: "250px" }}>
              <div style={{ fontWeight: "bold", color: "#d97706" }}>
                {r.menu?.name} (₹{r.menu?.pricePerHead}/head)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                {r.menu?.items?.length > 0 ? (
                  r.menu.items.map((item: string) => (
                    <Tag key={item} color="orange" style={{ margin: 0, fontSize: "10px" }}>{item}</Tag>
                  ))
                ) : (
                  <Text type="secondary" style={{ fontSize: "12px" }}>No items listed</Text>
                )}
              </div>
            </div>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, r: any) => (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => { setSelectedOrder(r); setIsModalOpen(true); }}
                style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16", width: "100%" }}
              >
                Broadcast
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                style={{ width: "100%" }}
                onClick={() => {
                  if (window.confirm("Reject request?")) deleteOrder({ resource: "orders", id: r.id });
                }}
              >
                Reject
              </Button>
            </Space>
          )}
        />
      </Table>

      {isModalOpen && selectedOrder && (
        <BroadcastModal order={selectedOrder} allCaterers={caterers} onClose={() => setIsModalOpen(false)} onRefresh={refetch} />
      )}
    </List>
  );
};