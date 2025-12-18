import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient'
import { toast, ToastContainer } from 'react-toastify';
import api from '../api/axiosInstance';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productId = localStorage.getItem('selectedProductId');

    if (productId) {
      api
        .get(`/products/${productId}/`) // Cambia la URL según tu API
        .then((response) => {
          console.log('Detalles del producto obtenidos:', response.data.datos);
          setProduct(response.data.datos);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error al obtener los detalles del producto:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleAddToCart = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const focusp = localStorage.getItem('selectedProductId');
    const quantityInput = document.getElementById('qty');
    const quantity = parseInt(quantityInput.value, 10);

    if (!session) {
      toast.error('Please log in to add products to your cart', { autoClose: true });
      return;
    }

    try {
      const response = await api.post('/cart/items/', {
        product_id: focusp,
        quantity: quantity,
      });
      toast.success('Succesfully added!', { autoClose: true });
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      alert('Hubo un error al añadir el producto al carrito');
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!product) {
    return <p>No se encontraron detalles para este producto.</p>;
  }

  return (
    
    <div className="single-product-area section-padding-100 clearfix">
        <div>
            {/* Alertas de las mas alta calidddddaa */}
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
        </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mt-50">
                <li className="breadcrumb-item"><a href="/shop">Shop</a></li>
                <li className="breadcrumb-item"><a>{product.category}</a></li>
                <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-lg-7">
            <div className="single_product_thumb">
              {/* Muestra solo la imagen obtenida desde product.image_url */}
              <img className="d-block w-100" src={product.imageurl} alt={product.name} />
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="single_product_desc">
              <div className="product-meta-data">
                <div className="line"></div>
                <p className="product-price">${product.price}</p>
                <a href="/productDetails">
                  <h6>{product.name}</h6>
                </a>
                <div className="ratings-review mb-15 d-flex align-items-center justify-content-between">
                  <div className="ratings">
                    <i className="fa fa-star" aria-hidden="true"></i>
                    <i className="fa fa-star" aria-hidden="true"></i>
                    <i className="fa fa-star" aria-hidden="true"></i>
                    <i className="fa fa-star" aria-hidden="true"></i>
                    <i className="fa fa-star" aria-hidden="true"></i>
                  </div>
                  <div className="review">
                    <a href="#">Write A Review</a>
                  </div>
                </div>
                <p className="availability"><i className="fa fa-circle"></i> In Stock</p>
              </div>

              <div className="short_overview my-5">
                <p>{product.description}</p>
              </div>

              <form className="cart clearfix" method="post">
                <div className="cart-btn d-flex mb-50">
                  <p>Qty</p>
                  <div className="quantity">
                    <span className="qty-minus" onClick={() => {
                      const effect = document.getElementById('qty');
                      const qty = parseInt(effect.value);
                      if (!isNaN(qty) && qty > 1) effect.value = qty - 1;
                      return false;
                    }}>
                      <i className="fa fa-caret-down" aria-hidden="true"></i>
                    </span>
                    <input type="number" className="qty-text" id="qty" step="1" min="1" max="300" name="quantity" defaultValue="1" />
                    <span className="qty-plus" onClick={() => {
                      const effect = document.getElementById('qty');
                      const qty = parseInt(effect.value);
                      if (!isNaN(qty)) effect.value = qty + 1;
                      return false;
                    }}>
                      <i className="fa fa-caret-up" aria-hidden="true"></i>
                    </span>
                  </div>
                </div>
                <button onClick={handleAddToCart} type="button" className="btn amado-btn">Add to cart</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
