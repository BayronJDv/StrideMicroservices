import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import styles from '../../css/admin.module.css';
import api from '../../api/axiosInstance';

export function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // Obtener productos al cargar el componente
    api.get('/admin/products/getall/')
      .then(response => {
        console.log("Fetched products:", response.data);
        setProducts(response.data.products);
      })
      .catch(error => {
        console.error("There was an error fetching the products!", error);
      });
  }, []);

  const handleSaveProduct = (product) => {
    if (editingProduct) {
      // Actualizar el producto
      api.put(`/admin/products/edit/${product.id}/`, product)
        .then(response => {
          setProducts(products.map(p => p.id === product.id ? product: p));
          setShowForm(false);
          setEditingProduct(null);
        })
        .catch(error => {
          console.error("There was an error updating the product!", error);
        });
    } else {
      // Crear un nuevo producto
      api.post('/admin/products/add/', product)
        .then(response => {
          console.log("Created product:", response.data.datos);
          setProducts([...products, product]);

          setShowForm(false);
        })
        .catch(error => {
          console.error("There was an error creating the product!", error);
          setProducts(products.filter(p => p.id !== product.id));
        });

    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    console.log(product.imageurl)
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    api.delete(`/admin/products/delete/${productId}/`)
      .then(() => {
        setProducts(products.filter(p => p.id !== productId));
      })
      .catch(error => {
        console.error("There was an error deleting the product!", error);
      });
  };

  return (
    <div className={styles["products-manager"]}>
      <div className={styles["header-actions"]}>
        <h2>Product Management</h2>
        <button
          className={`${styles.btn} ${styles["btn-primary"]}`}
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          Add New Product
        </button>
      </div>

      {showForm ? (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      ) : (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
