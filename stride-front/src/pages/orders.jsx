import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, CircleX } from 'lucide-react';
import styles from '../css/orders.module.css'; // Importar el archivo CSS modular
import api from '../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar las órdenes desde el backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/order/list/');
        setOrders(response.data);
      } catch (err) {
        setError(err.response ? err.response.data.detail : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Marcar como completada
  const handleMarkAsCompleted = async (orderId) => {
    try {
      await api.patch(`/order/update/${orderId}/`, {
        status: 'completed',
      });

      // Actualiza el estado local de la orden
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: 'completed' } : order
        )
      );
    } catch (err) {
      const message = err.response ? err.response.data.detail : 'Failed to update order status';
      toast.error(message, { autoclose: true });
      setError(message);
    }
  };

  const handleMarkAsCanceled = async (orderId) => {
    try {
      await api.patch(`/order/update/${orderId}/`, {
        status: 'cancelled',
      });
      // Actualiza el estado local de la orden
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
    } catch (err) {
      const message = err.response ? err.response.data.detail : 'Failed to update order status';
      setError(message);
      toast.error(message, { autoclose: true });
    }
  };
  if (loading) {
    return <div style={{ justifyContent: "center", alignItems: "center" }}>Loading orders...</div>;
  }

  if (error) {
    toast.error("Error!", { autoclose: true });
    return <div style={{ justifyContent: "center", alignItems: "center" }}>Error: {error}</div>;
  }

  return (
    <div className={styles["orders-container"]}>
      <div className={styles["orders-content"]}>
        <div>
          <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
        </div>
        <div className={styles["orders-header"]}>
          <Package size={32} className={styles["orders-icon"]} />
          <h1 className={styles["orders-title"]}>My Orders</h1>
        </div>

        <div className={styles["orders-list"]}>
          {orders.map((order) => (
            <div key={order.id} className={styles["order-card"]}>
              <div className={styles["order-content"]}>
                <div className={styles["order-image-container"]}>
                  <img
                    src="https://previews.123rf.com/images/robuart/robuart1603/robuart160300435/54338852-packing-product-icon-design-style-boxes-icon-logo-box-delivery-package-service-transportation.jpg"
                    alt=""
                    className={styles["order-image"]}
                  />
                </div>

                <div className={styles["order-details"]}>
                  <div className={styles["order-title"]}>
                    <h3 className={styles["order-name"]}>
                      Order Date: {new Date(order.created_at).toLocaleDateString()}
                    </h3>
                  </div>

                  <div className={styles["order-info"]}>
                    <div className={styles["order-date"]}>
                      <Package size={18} />
                      <span>Package quantity: 1 </span>
                    </div>

                    <div className={styles["order-status"]}>
                      <span className={styles["status-label"]}>Status:</span>
                      <span
                        className={`${styles["status-value"]} ${styles[order.status]}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className={styles["order-id"]}>
                    <span>Order Id: {order.id}</span>
                  </div>

                  <div className={styles["order-actions"]}>
                    <div>
                      <span className={styles["order-price"]}>
                        Total amount: ${order.total_price}
                      </span>
                    </div>
                    <div className={styles["right-divs"]}>
                      {order.status === 'paid' && (
                        <>
                          <button
                            onClick={() => handleMarkAsCompleted(order.id)}
                            className={styles["mark-received-btn"]}
                          >
                            <CheckCircle size={18} />
                            Mark as Received
                          </button>

                          <button
                            onClick={() => handleMarkAsCanceled(order.id)}
                            className={styles["mark-canceled-btn"]}
                          >
                            <CircleX size={18} />
                            Cancel this Order
                          </button>
                        </>
                      )}
                    </div>
                    {order.status === 'pending' && (<div className={styles["pending-note"]}>Your order is pending. Please complete the payment go to checkout</div>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
