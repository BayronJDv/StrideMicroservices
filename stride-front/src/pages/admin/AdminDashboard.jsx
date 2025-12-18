import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProductsManager } from './ProductsManager';
import { UserOrders } from './UserOrders';
import { Analytics } from './Analytics';
import styles from '../../css/admin.module.css';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <UserOrders />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className={styles["admin-container"]}>
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
      />
      <div className={styles["content-wrapper"]}>
        <Header toggleSidebar={toggleSidebar} />
        <main className={styles["main-content"]}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}