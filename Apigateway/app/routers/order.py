import os

import httpx
from fastapi import APIRouter, Body, Header, HTTPException

from ..core.Auth import is_authenticated, is_admin

router = APIRouter(prefix="/order", tags=["order"])

CART_SERVICE_URL = os.getenv("CART_SERVICE_URL", "http://localhost:5001")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:5002")

@router.post("/create")
async def create_order(authorization: str = Header(...)):
    """
    1. Valida usuario
    2. Obtiene carrito
    3. Crea orden
    4. Vacía carrito, si primero se vaciase habria que ejecutar compensasion 
    """
    try:
        # 1️⃣ Autenticación
        user_id = is_authenticated(authorization)

        async with httpx.AsyncClient(timeout=10.0) as client:

            # 2️⃣ Obtener carrito
            cart_response = await client.post(
                f"{CART_SERVICE_URL}/cart",
                json={"user_id": user_id}
            )

            if cart_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail="Could not retrieve cart"
                )

            cart = cart_response.json()
            items = cart.get("items", [])

            if not items:
                raise HTTPException(
                    status_code=400,
                    detail="Cart is empty"
                )

            # 3️⃣ Crear orden en Order Service
            order_payload = {
                "user_id": user_id,
                "items": items
            }

            order_response = await client.post(
                f"{ORDER_SERVICE_URL}/orders",
                json=order_payload
            )

            if order_response.status_code != 201:
                raise HTTPException(
                    status_code=order_response.status_code,
                    detail=order_response.json()
                )

            order_data = order_response.json()

            # 4️⃣ Limpiar carrito
            await client.post(
                f"{CART_SERVICE_URL}/cart/clear",
                json={"user_id": user_id}
            )

        return {
            "message": "Order created successfully",
            "order_id": order_data["order_id"]
        }

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Service unavailable"
        )

@router.get("/check-pending")
async def check_pending_order(authorization: str = Header(...)):
    """
    Verifica si el usuario tiene una orden pendiente
    """
    try:
        # 1️⃣ Validar usuario
        user_id = is_authenticated(authorization)

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{ORDER_SERVICE_URL}/check-pending",
                params={"user_id": user_id}
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        return response.json()

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Order service unavailable"
        )

@router.get("/list")
async def list_orders(authorization: str = Header(...)):
    """
    Lista todas las órdenes del usuario autenticado
    o todas si el usuario es admin
    """
    try:
        # 1️⃣ Validar usuario
        user_id = is_authenticated(authorization)
        role = is_admin(authorization)
        print("role founded", role)
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{ORDER_SERVICE_URL}/orderslist",
                params={"user_id": user_id,
                "role": role}
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        return response.json()

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Order service unavailable"
        )

@router.patch("/update/{order_id}/")
async def update_order_status(
    order_id: int,
    authorization: str = Header(...),
    body: dict = Body(...)
):
    """
    Body:
    {
      "status": "completed" | "cancelled | shipped |" 
    }
    """
    try:
        is_authenticated(authorization)

        status = body.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="status is required")

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.patch(
                f"{ORDER_SERVICE_URL}/orders/{order_id}",
                json={"status": status}
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        return response.json()

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Order service unavailable"
        )

