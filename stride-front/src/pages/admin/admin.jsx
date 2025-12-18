import React from 'react';
import { AdminDashboard } from './AdminDashboard';
import styles from '../../css/admin.module.css';

function Admin() {
  // Usar la misma función de isSuperuser para determinar si se debe mostrar el dashboard
  const isSuperuser = true;

  return (
    isSuperuser && (
      <div className={styles.admin}>
        <div className={`${styles["min-h-screen"]} ${styles["bg-gray-100"]}`}>
          <AdminDashboard />
        </div>
      </div>
    )
  );
}

export default Admin;
