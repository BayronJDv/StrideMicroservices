import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../css/admin.module.css';
import api from '../../api/axiosInstance';

export function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null); // Orden seleccionada
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/order/list/');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again later.');
      }
    };

    fetchOrders();
  }, []);

  const toggleDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <h2>Orders</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles["table-container"]}>
        <table className={styles["data-table"]}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Username</th>
              <th>Total</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td>{order.id}</td>
                    <td>{order.user || 'N/A'}</td>
                    <td>${order.total_price.toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className={`${styles.btn} ${styles["btn-primary"]}`} onClick={() => toggleDetails(order.id)}>
                        {expandedOrder === order.id ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan="5">
                        <div className={styles["details-container"]}>
                          <h4>Shipping Information</h4>
                          {order.shipping_address ? (
                            <>
                              <p><strong>Address:</strong> {order.shipping_address}</p>
                            </>
                          ) : (
                            <p>No shipping information available.</p>
                          )}

                          <h4>Order Items</h4>
                          {order.order_items.length > 0 ? (
                            order.order_items.map(item => (
                              <p key={item.product}>
                                {item.quantity} x {item.product_name}
                              </p>
                            ))
                          ) : (
                            <p>No items in this order.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5">No orders available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
