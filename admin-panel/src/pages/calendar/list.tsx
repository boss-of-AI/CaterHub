import React from "react";
import { useTable } from "@refinedev/antd";
import { Calendar, Badge, Modal, Typography, Spin } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export const EventCalendarList: React.FC = () => {
    const { tableProps } = useTable({
        resource: "orders",
        filters: {
            permanent: [{ field: "status", operator: "eq", value: "CONFIRMED" }]
        },
        meta: {
            populate: ["customer", "finalCaterer"]
        },
        pagination: { mode: "off" }
    });

    const isLoading = tableProps.loading;
    const ordersData = tableProps.dataSource || [];

    const getListData = (value: Dayjs) => {
        let listData: any[] = [];
        if (!ordersData) return listData;

        ordersData.forEach((order: any) => {
            const orderDate = dayjs(order.eventDate);
            if (value.isSame(orderDate, 'day')) {
                listData.push({
                    type: 'success',
                    content: `${order.customer?.name} - ${order.headcount} Guests`,
                    order
                });
            }
        });
        return listData;
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {listData.map((item) => (
                    <li key={item.order.id} style={{ marginBottom: "4px" }} onClick={() => showOrderDetails(item.order)}>
                        <Badge status={item.type as any} text={<span style={{ fontSize: "10px", fontWeight: "bold" }}>{item.content}</span>} />
                    </li>
                ))}
            </ul>
        );
    };

    const showOrderDetails = (order: any) => {
        Modal.info({
            title: 'Confirmed Event Details',
            content: (
                <div>
                    <p><strong>Customer:</strong> {order.customer?.name} ({order.customer?.phoneNumber})</p>
                    <p><strong>Location:</strong> {order.eventLocation}</p>
                    <p><strong>Time:</strong> {dayjs(order.eventDate).format('hh:mm A')}</p>
                    <p><strong>Headcount:</strong> {order.headcount}</p>
                    <p><strong>Caterer:</strong> {order.finalCaterer?.name} 📞 {order.finalCaterer?.phone}</p>
                    <p><strong>Total Income:</strong> ₹{order.totalAmount}</p>
                    <p><strong>Advance Paid:</strong> ₹{order.confirmationFee}</p>
                </div>
            ),
        });
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', margin: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
            <Title level={3}>Event Calendar (Confirmed Bookings)</Title>
            <Calendar 
                cellRender={(current, info) => {
                    if (info.type === 'date') return dateCellRender(current);
                    return info.originNode;
                }} 
            />
        </div>
    );
};
