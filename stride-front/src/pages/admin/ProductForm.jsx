import React, { useState, useEffect } from 'react';
import styles from '../../css/admin.module.css';

export function ProductForm({ product, onSave, onCancel }) {
  const initialProduct = {
    id: '',
    name: '',
    description: '',
    brand: '',
    category: '',
    price: 0,
    stock: 0,
    imageurl: ''
  };

  const [formData, setFormData] = useState(initialProduct);

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form-container"]}>
      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Product Name</label>
        <input
          type="text"
          className={styles["form-input"]}
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Description</label>
        <textarea
          className={styles["form-textarea"]}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Brand</label>
        <input
          type="text"
          className={styles["form-input"]}
          value={formData.brand}
          onChange={e => setFormData({ ...formData, brand: e.target.value })}
          required
        />
      </div>

      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Category</label>
        <input
          type="text"
          className={styles["form-input"]}
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      
      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Price</label>
        <input
          type="number"
          step="10"
          className={styles["form-input"]}
          value={formData.price}
          onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          required
        />
      </div>
      
      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Stock</label>
        <input
          type="number"
          className={styles["form-input"]}
          value={formData.stock}
          onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className={styles["form-group"]}>
        <label className={styles["form-label"]}>Image URL</label>
        <input
          type="text"
          className={styles["form-input"]}
          value={formData.imageurl}
          onChange={e => setFormData({ ...formData, imageurl: e.target.value })}
          required
        />
      </div>
      
      <div className={styles["form-actions"]}>
        <button type="submit" className={`${styles.btn} ${styles["btn-primary"]}`}>
          {product ? 'Update Product' : 'Add Product'}
        </button>
        <button 
          type="button"
          className={`${styles.btn} ${styles["btn-secondary"]}`}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}