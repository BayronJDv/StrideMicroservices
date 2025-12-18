import React, { useState, useEffect } from 'react';

const Home = () => {
  const [columns, setColumns] = useState(3); // Número inicial de columnas

  const images = [

    { src: 'img/bg-img/1.jpg', alt: 'pretty dirty boy ', price: '$180', title: 'imagen 6 ' },
    { src: 'img/bg-img/5.jpg', alt: 'Test Image 5', price: '$18', title: 'Test Image 5' },
    { src: 'img/bg-img/8.jpg', alt: 'Test Image 8', price: '$318', title: 'Test Image 8' },
    { src: 'img/bg-img/2.jpg', alt: 'Test Image 2', price: '$180', title: 'Test Image 2' },
    { src: 'img/bg-img/6.jpg', alt: 'Test Image 6', price: '$320', title: 'Test Image 6' },
    { src: 'img/bg-img/9.jpg', alt: 'Test Image 9', price: '$318', title: 'Test Image 9' },
    { src: 'img/bg-img/3.jpg', alt: 'Test Image 3', price: '$180', title: 'Test Image 3' },
    { src: 'img/bg-img/4.jpg', alt: 'Test Image 4', price: '$180', title: 'Test Image 4' },
    { src: 'img/bg-img/7.jpg', alt: 'Test Image 7', price: '$318', title: 'Test Image 7' },
  ];
  
  // Función para actualizar el número de columnas según el tamaño de la ventana
  const updateColumns = () => {
    const width = window.innerWidth;
    if (width > 1200) setColumns(3);
    else if (width >= 992 && width <= 1199) setColumns(2);
    else if (width >= 768 && width <= 991) setColumns(1);
    else if (width >= 576 && width <= 767) setColumns(2);
    else setColumns(1);
  };

  useEffect(() => {
    updateColumns(); // Actualizar columnas al cargar
    window.addEventListener('resize', updateColumns); // Escuchar cambios de tamaño
    return () => window.removeEventListener('resize', updateColumns); // Limpiar evento
  }, []);

  return (
    <div className="products-catagories-area clearfix">
        <div className="catagory clearfix">
            <div className="masonry-layout" style={{ columnCount: columns }}>
                {images.map((image, index) => (
                    <div className="single-products-catagory clearfix"  key={index}>
                        <a href="/shop">
                            <img src={image.src} alt={image.alt} />
                            <div className="hover-content">
                            <div className="line"></div>
                            <p>From {image.price}</p>
                            <h4>{image.title}</h4>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </div>

  );
};

export default Home;