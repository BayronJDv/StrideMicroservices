afterEach(() => {
  // Limpiar los mock después de cada prueba
  jest.restoreAllMocks();
});
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
//Es mejor dejar lo de arriba asi

import OrderPage from "../../pages/orders.jsx"; //esto cambia segun la pagina necesaria

jest.mock("../../api/axiosInstance", () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      patch: jest.fn(),
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

import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

//A partir de este punto se pueden usar los test

describe("OrderPage tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Deberia mostrar un estado de carga", () => {
    api.get.mockImplementation(() => new Promise(() => {})); // nunca da respuesta

    render(<OrderPage />);

    expect(screen.getByText(/Loading orders/i)).toBeInTheDocument();
  });

  test("Deberia agregar los elementos y renderizarlos", async () => {
    // Configura los datos que vam a ser enviados
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl:
            "https://cdn-icons-png.flaticon.com/512/5147/5147892.png",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    render(<OrderPage />);

    // Espera que el texto cargado se vea
    await waitFor(() => {
      expect(screen.getByText(/Order Date/i)).toBeInTheDocument();
      expect(screen.getByText(/Package quantity: 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Shipped/i)).toBeInTheDocument();
      expect(screen.getByText(/Total amount: \$100/i)).toBeInTheDocument();
    });
  });

  test("Deberia mostrar un error si el llamado a la api falla", async () => {
    const errorMessage = "Error:";
    api.get.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<OrderPage />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  test("Deberia mostrar un error generico cuando la api falla sin detalles", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"));

    render(<OrderPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to fetch orders")
      ).toBeInTheDocument();
    });
  });

  test("Deberia marcar la orden como entregada", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl:
            "https://cdn-icons-png.flaticon.com/512/5147/5147892.png",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
        {
          id: 2,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl:
            "https://cdn-icons-png.flaticon.com/512/5147/5147892.png",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    api.patch.mockResolvedValueOnce({}); // Respuesta vacia simulada

    render(<OrderPage />);

    // Espera que cargue la orden
    await waitFor(() => screen.getAllByText(/Mark as Received/i));

    const btnMarkAsReceived = screen.getAllByText(/Mark as Received/i);
    await userEvent.click(btnMarkAsReceived[0]);

    // Verifica que se haya llamado a la API con los parámetros correctos
    expect(api.patch).toHaveBeenCalledWith("/api/orders/orders/1/", {
      status: "completed",
    });

    await waitFor(() => {
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/shipped/i)).toBeInTheDocument();
  });

  test("Deberia mostrar error cuando el boton marcar como entregado falla", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl: "https://example.com/image.jpg",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    const errorMessage = "Failed to update order";
    api.patch.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
      isAxiosError: true,
    });

    render(<OrderPage />);

    await waitFor(() => screen.getByText(/Mark as Received/i));

    const btnMarkAsReceived = screen.getByText(/Mark as Received/i);
    await userEvent.click(btnMarkAsReceived);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test("Deberia marcar la orden como cancelada", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl:
            "https://cdn-icons-png.flaticon.com/512/5147/5147892.png",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
        {
          id: 2,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl:
            "https://cdn-icons-png.flaticon.com/512/5147/5147892.png",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    api.patch.mockResolvedValueOnce({});

    render(<OrderPage />);

    await waitFor(() => screen.getAllByText(/Cancel this Order/i));
    const btnCancel = screen.getAllByText(/Cancel this Order/i);
    await userEvent.click(btnCancel[0]);

    expect(api.patch).toHaveBeenCalledWith("/api/orders/orders/1/", {
      status: "cancelled",
    });

    await waitFor(() => {
      expect(screen.getByText(/Cancelled/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/shipped/i)).toBeInTheDocument();
  });

  test("Deberia mostar el error cuando la cancelacion de la orden falla", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl: "https://example.com/image.jpg",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    const errorMessage = "Failed to update order";
    api.patch.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
      isAxiosError: true,
    });

    render(<OrderPage />);

    await waitFor(() => screen.getByText(/Cancel this Order/i));

    const btnCancel = screen.getByText(/Cancel this Order/i);
    await userEvent.click(btnCancel);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test("Muestra mensaje por defecto si la api falla sin error en entregado", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl: "https://example.com/image.jpg",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    api.patch.mockRejectedValueOnce(new Error("Network error"));

    render(<OrderPage />);
    await waitFor(() => screen.getByText(/Mark as Received/i));
    userEvent.click(screen.getByText(/Mark as Received/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update order status",
        expect.any(Object)
      );
    });
  });

  test("Muestra mensaje por defecto si la api falla sin error en cancelado", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl: "https://example.com/image.jpg",
          packageQty: 2,
          status: "shipped",
          Totalprice: 100,
        },
      ],
    });

    api.patch.mockRejectedValueOnce(new Error("Network error"));

    render(<OrderPage />);
    await waitFor(() => screen.getByText(/Cancel this Order/i));
    const btnCancel = screen.getByText(/Cancel this Order/i);
    await userEvent.click(btnCancel);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update order status",
        expect.any(Object)
      );
    });
  });

  test("Deberia renderizar las ordenes completadas o canceladas correctamente", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          orderDate: "2025-05-01T00:00:00Z",
          FirstProductImageUrl: "https://example.com/image1.jpg",
          packageQty: 1,
          status: "completed",
          Totalprice: 50,
        },
        {
          id: 2,
          orderDate: "2025-05-02T00:00:00Z",
          FirstProductImageUrl: "https://example.com/image2.jpg",
          packageQty: 3,
          status: "cancelled",
          Totalprice: 150,
        },
      ],
    });

    render(<OrderPage />);

    await waitFor(() => {
      // Verifica el primer pedido (completado)
      expect(screen.getByText(/Total amount: \$50/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();

      // Verifica el segundo pedido (cancelado)
      expect(screen.getByText(/Total amount: \$150/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancelled/i)).toBeInTheDocument();

      // Verifica que no se muestren los botones para pedidos completados o cancelados
      const markAsReceived = screen.queryAllByText(/Mark as Received/i);
      const cancelOrder = screen.queryAllByText(/Cancel this Order/i);
      expect(markAsReceived.length).toBe(0);
      expect(cancelOrder.length).toBe(0);
    });
  });

  test("Deberia renderizar la pagina sin ordenes", async () => {
    api.get.mockResolvedValueOnce({
      data: [],
    });

    render(<OrderPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Order Date/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Mark as Received/i)).not.toBeInTheDocument();
    });
  });
});