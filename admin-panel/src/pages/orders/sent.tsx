import React from "react";
import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Typography, Space, Button, message } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { HttpError } from "@refinedev/core";
import api from "../../api/axios";

const { Text } = Typography;

export const SentToCaterersList = () => {
    const { tableProps, ...tableResult } = useTable<any, HttpError>({
        resource: "orders",
        filters: {
            permanent: [{ field: "status", operator: "eq", value: "BROADCASTED" }],
        },
        meta: {
            populate: ["customer", "menu", "possibleCaterers.caterer"],
        },
    });

    const refetch = () => {
        const result = tableResult as any;
        const f = result.tableQueryResult?.refetch || result.queryResult?.refetch;
        if (f) f();
        else window.location.reload();
    };

    const handleFinalize = async (orderId: string, catererId: string, catererName: string) => {
        if (window.confirm(`Assign this order to ${catererName}?`)) {
            try {
                await api.patch(`/orders/${orderId}/assign`, { catererId });
                message.success(`Order successfully assigned to ${catererName}!`);
                refetch();
            } catch (err) {
                message.error("Failed to finalize order. Check backend logs.");
            }
        }
    };

    return (
        <List title="Active Broadcasts (Marketplace)">
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
                        <div style={{ maxWidth: "220px" }}>
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

                {/* Responses & Action */}
                <Table.Column
                    title="Caterer Responses"
                    render={(_, r: any) => (
                        <Space direction="vertical" style={{ width: "250px" }}>
                            {(!r.possibleCaterers || r.possibleCaterers.length === 0) && (
                                <Text type="secondary">Waiting for responses...</Text>
                            )}

                            {r.possibleCaterers?.map((asn: any, i: number) => (
                                <div key={i} className="flex flex-col gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm mb-2">
                                    <div className="flex justify-between items-center">
                                        <Text strong style={{ fontSize: "12px" }}>{asn.caterer?.name}</Text>
                                        <Text strong style={{ color: "#fa8c16" }}>₹{asn.adminSetPrice}</Text>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Tag color={asn.status === "ACCEPTED" ? "green" : "orange"} style={{ margin: 0 }}>
                                            {asn.status}
                                        </Tag>
                                        {asn.status === "ACCEPTED" && (
                                            <button
                                                style={{
                                                    padding: "2px 8px",
                                                    fontSize: "12px",
                                                    backgroundColor: "#52c41a",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => handleFinalize(r.id, asn.catererId, asn.caterer?.name)}
                                            >
                                                Finalize
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};