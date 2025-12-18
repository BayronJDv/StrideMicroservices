import os
import random
import httpx
from fastapi import APIRouter, Body, Header, HTTPException

from ..core.Auth import is_authenticated,get_email

router = APIRouter(prefix="/payment", tags=["payment"])

ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:5002")
PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:5003")
PRODUCTS_SERVICE_URL = os.getenv("PRODUCTS_SERVICE_URL", "http://localhost:5000")



# esta api llamara a un microservicio de pagos en express que sera el encargado de gestionar los recibos y metodos de pago
@router.post("/process-payment")
async def process_payment(
    payload: dict = Body(...),
    authorization: str = Header(...)
):
    """
    Payload:
    {
      "paymentInfo": {...},
      "ship_info": {...}
    }
    """

    # 1️⃣ Auth (NO compensable)
    user_id = is_authenticated(authorization)
    ship_info = payload["ship_info"]
    address = ship_info.get("address","")
    print("usuario validado")
    print("llego esta address",address)

    async with httpx.AsyncClient(timeout=10.0) as client:

        # 2️⃣ Obtener orden pendiente
        order_resp = await client.get(
            f"{ORDER_SERVICE_URL}/check-pending",
            params={"user_id": user_id}
        )

        if not order_resp.json()["has_pending"]:
            raise HTTPException(400, "No pending order")

        order = order_resp.json()["order"]
        print("orden pendiente obtenida:")
        # Flags para compensación
        stock_reduced = False
        receipt_created = False

        try:
            # 3️⃣ Reducir stock (COMPENSABLE)
            stock_resp = await client.post(
                f"{PRODUCTS_SERVICE_URL}/reduce-stock",
                json={"items": order["order_items"]}
            )
            stock_reduced = True
            print("stock reducido exitosamente")
            # 4️⃣ Simular pasarela de pago (NO compensable)
            if random.random() < 0.3:
                print("fallo en la pasarela de pago")
                raise Exception("Payment gateway rejected the transaction")

            # 4️⃣.5 Agregar dirección a la orden
            address_resp = await client.patch(
                f"{ORDER_SERVICE_URL}/address/{order['id']}",
                json={"address": address}
            )
            print("dirección agregada a la orden exitosamente")

            # 5️⃣ Crear recibo (COMPENSABLE)
            email = get_email(authorization)
            print(payload["paymentInfo"])
            receipt_resp = await client.post(
                f"{PAYMENT_SERVICE_URL}/receipts",
                json={
                    "order_id": order["id"],
                    "user_id": user_id,
                    "amount": order["total_price"],
                    "payment_info": payload["paymentInfo"],
                    "ship_info": payload["ship_info"],
                    "receipt_items": order["order_items"],
                    "user_email": email
                }
            )
            receipt_id = receipt_resp.json()["receipt_id"]
            receipt_created = True

            # 6️⃣ Actualizar orden a PAID (COMPENSABLE)
            await client.patch(
                f"{ORDER_SERVICE_URL}/orders/{order['id']}",
                json={"status": "paid"}
            )

        except Exception as e:
            # 🔁 COMPENSACIONES
            if receipt_created:
                await client.delete(
                    f"{PAYMENT_SERVICE_URL}/receipts/{receipt_id}"
                )

            if stock_reduced:
                await client.post(
                    f"{PRODUCTS_SERVICE_URL}/restore-stock",
                    json={"items": order["order_items"]}
                )
                print("stock restaurado exitosamente")

            raise HTTPException(400, str(e))


    return {
        "message": "Payment processed successfully check your email for the receipt"
    }