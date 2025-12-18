import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import api from '../api/axiosInstance';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    useEffect(() => {
        const fetchCartItems = async () => {
            const token_key = localStorage.getItem('token');

            try {
                const response = await api.post('/cart/', 
                    { token_key: token_key }
                );
                setCartItems(response.data.items);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        fetchCartItems();
    }, []);

    const Remove = async (productId) => {
        try {
            const response = await api.delete('/cart/items/', {
                data: {
                    product_id: productId,
                }
            });

            if (response.data.exito) {
                setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
                toast.success('Successfully Removed!', { autoClose: true });
            } else {
                toast.error("Error deleting!", { autoClose: true });
                console.error("Error removing item from cart:", response.data.message);
            }
        } catch (error) {
            console.error("Error during remove request:", error);
            toast.error("Failed to remove item!", { autoClose: true });
        }
    };

    const handleCreateOrder = async () => {
        try {
            // Verificar si hay órdenes pendientes
            const checkResponse = await api.get(
                "/order/check-pending/"
            );
    
            if (checkResponse.data.has_pending) {
                toast.warning("order pending payment. Complete or cancel your order before creating a new one.");
                return; // Salir si hay una orden pendiente
            }
            console.log("No pending orders, proceeding to create a new order.");
            // Crear una nueva orden
            const createResponse = await api.post(
                "/order/create/"
            );
    
            toast.success( createResponse.data.message + " Redirecting to checkout... ");
            navigate("/checkout");
        } catch (error) {
            console.error("Error creando la orden:", error.response ? error.response.data : error);
            toast.error("Error creando la orden: " + (error.response ? error.response.data : error.message));
        }
    };

    const totalSum = cartItems.reduce((acc, item) => acc + item.product_price * item.quantity, 0);

  return (
    <div className="cart-table-area section-padding-100">
        
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 col-lg-8">
                        <div className="cart-title mt-50">
                            <h2>Shopping Cart</h2>
                        </div>

                        <div className="cart-table clearfix">
                            <table className="table table-responsive">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map(item => (
                                        <tr key={item.product_id}>
                                            <td className="cart_product_img">
                                                <a href="#"><img src={item.product_image_url} alt="Product"/></a>
                                            </td>
                                            <td className="cart_product_desc">
                                                <h5>{item.product_name}</h5>
                                            </td>
                                            <td className="price">
                                                <span>${item.product_price}</span>
                                            </td>
                                            <td className="qty">
                                            <div className="qty-btn d-flex align-items-center">
                                                <p>Qty</p>
                                                <div className="quantity">
                                                    <input
                                                    type="number"
                                                    className="qty-text"
                                                    value={item.quantity}
                                                    readOnly
                                                    />
                                                </div>

                                                <div className="cart ms-3">
                                                    <a
                                                    data-toggle="tooltip"
                                                    data-placement="left"
                                                    title="Remove all"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        Remove(item.product_id); // Llama a la función remove pasando el id del producto
                                                      }}
                                                    >
                                                    <img src="img/core-img/papelera.png" alt="Remove " />
                                                    </a>
                                                </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <div className="cart-summary">
                            <h5>Cart Total</h5>
                            <ul className="summary-table">
                                <li><span>subtotal:</span> <span>${totalSum}</span></li>
                                <li><span>delivery:</span> <span>Free</span></li>
                                <li><span>total:</span> <span>${totalSum}</span></li>
                            </ul>
                            <div className="cart-btn mt-100">
                                <button 
                                    className="btn amado-btn w-100" 
                                    onClick={handleCreateOrder}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
};

export default Cart;