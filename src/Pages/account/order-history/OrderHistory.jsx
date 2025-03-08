import React from "react";
import './OrderHistory.css';

const OrderHistory = () => {
    const orders = [
        {id: 1, date: '2022-01-01', items: ['Pizza', 'Pasta'], total: 250},
        {id: 2, date: '2024-09-30', items: ['Burger', 'Fries'], total: 300}
    ];

    return (
        <div className="order-history">
            <h2>Order History</h2>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        <p>Date: {order.date}</p>
                        <p>Items: {order.items.join(', ')}</p>
                        <p>Total: ₹{order.total}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderHistory;