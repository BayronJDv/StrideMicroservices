import React from 'react';
import { Menu } from 'lucide-react';
import styles from '../../css/admin.module.css';

export function Header({ toggleSidebar }) {
  return (
    <header className={styles["mobile-header"]}>
      <h1>Admin Panel</h1>
      <button className={styles["menu-button"]} onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
    </header>
  );
}