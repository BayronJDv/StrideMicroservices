import React from 'react';
import styles from '../../css/admin.module.css';

export function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className={styles["table-container"]}>
      <table className={styles["data-table"]}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                {/* Asegurarse de que price es un número válido */}
                ${!isNaN(parseFloat(product.price)) ? parseFloat(product.price).toFixed(2) : 'N/A'}
              </td>
              <td>{product.stock}</td>
              <td className={styles["action-buttons"]}>
                <button
                  onClick={() => onEdit(product)}
                  className={`${styles["btn"]} ${styles["btn-secondary"]}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className={`${styles["btn"]} ${styles["btn-primary"]}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
