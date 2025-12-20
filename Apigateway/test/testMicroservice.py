import requests
from auth import get_auth_headers

BASE_URL = "http://localhost:8000"

def test_full_purchase_flow():
    HEADERS = get_auth_headers()
    # Proceso para el carrito (Microservicio product implicito)

    cart_add = requests.post(
        f"{BASE_URL}/cart/items",
        json={"product_id": 1, "quantity": 2},
        headers=HEADERS
    )

    #Producto para eliminar
    requests.post(
        f"{BASE_URL}/cart/items",
        json={"product_id": 2, "quantity": 1},
        headers=HEADERS
    )

    assert cart_add.status_code == 200

    cart_get = requests.post(
        f"{BASE_URL}/cart/",
        headers=HEADERS
    )

    assert cart_get.status_code == 200

    cart_del = requests.delete(
        f"{BASE_URL}/cart/items",
        json={"product_id": 2},
        headers=HEADERS
    )

    assert cart_del.status_code == 200


    # 2. Crear orden
    order_response = requests.post(
        f"{BASE_URL}/order/create",
        headers=HEADERS
    )
    assert order_response.status_code == 200
    assert order_response.json()["message"] == "Order created successfully"

    # 3. Procesar pago (Visible en logs desde el contenedor paymentService)
    payment = {
        "cardNumber": "123",
        "expiryDate": "12",
        "cvv": "123",}
    address = { "address" : 'Direccion'  }

    requests.post(
        f"{BASE_URL}/payment/process-payment",
        json={"paymentInfo" : payment ,
              "ship_info": address },
        headers=HEADERS
    )

if __name__ == "__main__":
    test_full_purchase_flow()
    print("Test completado exitosamente")