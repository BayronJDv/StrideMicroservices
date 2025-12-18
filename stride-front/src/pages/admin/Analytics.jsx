import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import styles from '../../css/admin.module.css';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export function Analytics() {

  const respuestaPosible = {
      TotalRevenue: 5200,
      TotalOrders: 420,
      TotalCustomers: 150,
      Totalprice: 500,      
    }
  // En la respuesta definir error para redireccionar la pagina  

    const salesDataArray = [120, 150, 90, 200, 250, 300, 100, 130, 170, 180, 220, 210, 250, 300, 350, 400, 370, 420, 450, 500, 480, 470, 460, 430, 410, 390, 350, 300, 320, 340, 300];

    const initialSales = salesDataArray[0];
    const latestSales = salesDataArray[salesDataArray.length - 1]; 
    const GrowthRate = parseFloat(((latestSales - initialSales) / initialSales * 100).toFixed(1));
  
    // Preparar los datos para el gráfico
    const chartData = {
      labels: Array.from({ length: salesDataArray.length }, (_, i) => (i + 1).toString()),
      datasets: [
        {
          label: "Ventas ($)",
          data: salesDataArray,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
      ],
    };
  
    // Configurar las opciones del gráfico
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "Ventas del Mes",
        },
        tooltip: {
          callbacks: {
            label: (context) => `$${context.raw}`, // Formato del tooltip
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Días del Mes",
          },
        },
        y: {
          title: {
            display: true,
            text: "Ventas en USD",
          },
          beginAtZero: true,
        },
      },
    };

  return (
    <div>
      <h2>Sales Analytics</h2>
      
      <div className={styles["stats-grid"]}>
        <div className={styles["stat-card"]}>
          <DollarSign color="#0e5a9b" />
          <h3>Total Revenue</h3>
          <p>${respuestaPosible.TotalRevenue}</p>
        </div>
        
        <div className={styles["stat-card"]}>
          <ShoppingCart color="#0e5a9b" />
          <h3>Total Orders</h3>
          <p>{respuestaPosible.TotalOrders}</p>
        </div>
        
        <div className={styles["stat-card"]}>
          <Users color="#0e5a9b" />
          <h3>Total Customers</h3>
          <p>{respuestaPosible.TotalCustomers}</p>
        </div>
        
        <div className={`${styles["growth-card"]} ${GrowthRate >= 0 ? styles["positive"] : styles["negative"]}`}>
          <TrendingUp color="#0e5a9b" />
          <h3>Growth Rate</h3>
          <p>{GrowthRate >= 0 ? `+${GrowthRate}%` : `${GrowthRate}%`}</p>
        </div>
      </div>

      <div className={styles["contenedor-grafico"]}>
        <h3>Monthly Sales</h3>
        <div className={styles["chart-container"]}>
            <Line data={chartData} options={options}/>
        </div>
      </div>
    </div>
  );
}