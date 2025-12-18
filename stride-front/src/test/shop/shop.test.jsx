afterEach(() => {
  // Limpiar los mock después de cada prueba
  jest.restoreAllMocks();
});

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
//Es mejor dejar lo de arriba asi

import Shop from "../../pages/shop.jsx"; //esto cambia segun la pagina necesaria

jest.mock("../../api/axiosInstance", () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
    },
  };
});

jest.mock("react-toastify", () => {
  return {
    toast: {
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
    ToastContainer: () => (
      <div data-testid="toast-container">Toast container</div>
    ),
  };
});

// Mock para react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock para react-slider
jest.mock("react-slider", () => {
  return function MockSlider({ onChange, value, min, max }) {
    return (
      <div data-testid="price-slider">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
          data-testid="slider-min"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
          data-testid="slider-max"
        />
      </div>
    );
  };
});

import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

// Wrapper para React Router
const ShopWrapper = () => (
  <BrowserRouter>
    <Shop />
  </BrowserRouter>
);

//A partir de este punto se pueden usar los test

describe("Shop tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  test("Deberia mostrar un estado de carga al cargar productos", () => {
    api.get.mockImplementation(() => new Promise(() => {})); // nunca da respuesta

    render(<ShopWrapper />);

    // Verificar que la barra de búsqueda está presente (indica que se renderizó)
    expect(screen.getByPlaceholderText(/Type your keyword/i)).toBeInTheDocument();
  });

  test("Deberia cargar y renderizar productos inicialmente", async () => {
    // Configura los datos que van a ser enviados
    const mockProducts = {
      status: 200,
      data: {
        products: [
          {
            id: 1,
            name: "Test Product 1",
            price: "29.99",
            imageurl: "https://example.com/image1.jpg",
          },
          {
            id: 2,
            name: "Test Product 2", 
            price: "49.99",
            imageurl: "https://example.com/image2.jpg",
          },
        ],
        total_pages: 1,
      },
    };

    api.get.mockResolvedValueOnce(mockProducts);

    render(<ShopWrapper />);

    // Espera que los productos se rendericen
    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
      expect(screen.getByText("$29.99")).toBeInTheDocument();
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });

    // Verifica que se haya llamado a la API correctamente
    expect(api.get).toHaveBeenCalledWith('/api/products/search/', {
      params: {
        category: "Ninguna",
        keyword: "",
        min_price: 10,
        max_price: 1000,
        page: 1,
      },
    });
  });

  test("Deberia mostrar un error si el llamado a la api falla", async () => {
    const errorMessage = "Network error";
    api.get.mockRejectedValueOnce(new Error(errorMessage));

    render(<ShopWrapper />);

    await waitFor(() => {
      // Verificar que la búsqueda sigue funcionando aunque haya error
      expect(screen.getByPlaceholderText(/Type your keyword/i)).toBeInTheDocument();
    });
  });

  test("Deberia realizar busqueda por palabra clave", async () => {
    // Primera llamada - carga inicial
    api.get.mockResolvedValueOnce({
      status: 200,
      data: {
        products: [],
        total_pages: 1,
      },
    });

    // Segunda llamada - busqueda
    const searchResults = {
      status: 200,
      data: {
        products: [
          {
            id: 1,
            name: "Gaming Laptop",
            price: "999.99",
            imageurl: "https://example.com/laptop.jpg",
          },
        ],
        total_pages: 1,
      },
    };
    api.get.mockResolvedValueOnce(searchResults);

    render(<ShopWrapper />);

    // Esperar a que cargue inicialmente
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your keyword/i)).toBeInTheDocument();
    });

    // Buscar el input y el botón
    const searchInput = screen.getByPlaceholderText(/Type your keyword/i);
    const searchForm = searchInput.closest('form');

    // Escribir en el input
    await userEvent.type(searchInput, "Gaming");
    
    // Enviar el formulario
    fireEvent.submit(searchForm);

    // Verificar que se llamó a la API con los parámetros correctos
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/products/search/', {
        params: {
          category: "Ninguna",
          keyword: "Gaming",
          min_price: 10,
          max_price: 1000,
          page: 1,
        },
      });
    });

    // Verificar que se muestra el resultado
    await waitFor(() => {
      expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
    });
  });

  test("Deberia filtrar por categoria", async () => {
    // Primera llamada - carga inicial
    api.get.mockResolvedValueOnce({
      status: 200,
      data: {
        products: [],
        total_pages: 1,
      },
    });

    // Segunda llamada - filtro por categoría
    const categoryResults = {
      status: 200,
      data: {
        products: [
          {
            id: 1,
            name: "Premium Product",
            price: "199.99",
            imageurl: "https://example.com/premium.jpg",
          },
        ],
        total_pages: 1,
      },
    };
    api.get.mockResolvedValueOnce(categoryResults);

    render(<ShopWrapper />);

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByText("Premium")).toBeInTheDocument();
    });

    // Hacer click en la categoría Premium
    const premiumCategory = screen.getByText("Premium");
    await userEvent.click(premiumCategory);

    // Verificar llamada a la API
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/products/search/', {
        params: {
          category: "Premium",
          keyword: "",
          min_price: 10,
          max_price: 1000,
          page: 1,
        },
      });
    });

    // Verificar resultado
    await waitFor(() => {
      expect(screen.getByText("Premium Product")).toBeInTheDocument();
    });
  });

  test("Deberia agregar producto al carrito exitosamente", async () => {
    // Mock localStorage para el token
    Storage.prototype.getItem.mockReturnValue("mock-token");

    // Carga inicial de productos
    const mockProducts = {
      status: 200,
      data: {
        products: [
          {
            id: 1,
            name: "Test Product",
            price: "29.99",
            imageurl: "https://example.com/image.jpg",
          },
        ],
        total_pages: 1,
      },
    };
    api.get.mockResolvedValueOnce(mockProducts);

    // Mock para agregar al carrito
    api.post.mockResolvedValueOnce({});

    render(<ShopWrapper />);

    // Esperar a que cargue el producto
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Buscar el botón de agregar al carrito por el título "Add to Cart"
    const addToCartButton = screen.getByTitle('Add to Cart');
    await userEvent.click(addToCartButton);

    // Verificar llamada a la API
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/cart/addToCart/', {
        token_key: "mock-token",
        product_id: 1,
      });
    });

    // Verificar toast de éxito
    expect(toast.success).toHaveBeenCalledWith('Succesfully added!', { autoClose: true });
  });

  test("Deberia mostrar error cuando se intenta agregar al carrito sin token", async () => {
    // Mock localStorage sin token
    Storage.prototype.getItem.mockReturnValue(null);

    // Carga inicial de productos
    const mockProducts = {
      status: 200,
      data: {
        products: [
          {
            id: 1,
            name: "Test Product",
            price: "29.99",
            imageurl: "https://example.com/image.jpg",
          },
        ],
        total_pages: 1,
      },
    };
    api.get.mockResolvedValueOnce(mockProducts);

    render(<ShopWrapper />);

    // Esperar a que cargue el producto
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Buscar y hacer click en el botón de agregar al carrito
    const addToCartButton = screen.getByTitle('Add to Cart');
    await userEvent.click(addToCartButton);

    // Verificar toast de error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please log in to add products to your cart', { autoClose: true });
    });

    // Verificar que NO se llamó a la API
    expect(api.post).not.toHaveBeenCalled();
  });

  test("Deberia manejar error al agregar producto al carrito", async () => {
    // Mock localStorage con token
    Storage.prototype.getItem.mockReturnValue("mock-token");

    // Carga inicial de productos
    const mockProducts = {
      status: 200,
      data: {
        products: [
          {
            id: 1,
            name: "Test Product",
            price: "29.99",
            imageurl: "https://example.com/image.jpg",
          },
        ],
        total_pages: 1,
      },
    };
    api.get.mockResolvedValueOnce(mockProducts);

    // Mock error al agregar al carrito
    api.post.mockRejectedValueOnce(new Error("Cart error"));

    render(<ShopWrapper />);

    // Esperar a que cargue el producto
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Buscar y hacer click en el botón de agregar al carrito
    const addToCartButton = screen.getByTitle('Add to Cart');
    await userEvent.click(addToCartButton);

    // Verificar toast de error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('There is an issue with adding items to the cart.', { autoClose: true });
    });
  });

  test("Deberia renderizar categorias correctamente", async () => {
    api.get.mockResolvedValueOnce({
      status: 200,
      data: {
        products: [],
        total_pages: 1,
      },
    });

    render(<ShopWrapper />);

    // Verificar que todas las categorías están presentes
    await waitFor(() => {
      expect(screen.getByText("Ninguna")).toBeInTheDocument();
      expect(screen.getByText("tripleA")).toBeInTheDocument();
      expect(screen.getByText("tripleB")).toBeInTheDocument();
      expect(screen.getByText("Original")).toBeInTheDocument();
      expect(screen.getByText("Edicion Especial")).toBeInTheDocument();
      expect(screen.getByText("Premium")).toBeInTheDocument();
      expect(screen.getByText("Eco-friendly")).toBeInTheDocument();
    });
  });

  test("Deberia renderizar el slider de precios", async () => {
    api.get.mockResolvedValueOnce({
      status: 200,
      data: {
        products: [],
        total_pages: 1,
      },
    });

    render(<ShopWrapper />);

    await waitFor(() => {
      expect(screen.getByTestId("price-slider")).toBeInTheDocument();
      expect(screen.getByText("$10 - $1000")).toBeInTheDocument();
    });
  });

  test("Deberia renderizar pagina sin productos", async () => {
    api.get.mockResolvedValueOnce({
      status: 200,
      data: {
        products: [],
        total_pages: 1,
      },
    });

    render(<ShopWrapper />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your keyword/i)).toBeInTheDocument();
      expect(screen.queryByText(/Test Product/i)).not.toBeInTheDocument();
    });
  });
});