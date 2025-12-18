import os

import httpx
from fastapi import APIRouter, Body, Header, HTTPException

from ..core.Auth import is_authenticated

router = APIRouter(prefix="/cart", tags=["Cart"])

CART_SERVICE_URL = os.getenv("CART_SERVICE_URL", "http://localhost:5001")
PRODUCTS_SERVICE_URL = os.getenv("PRODUCTS_SERVICE_URL", "http://localhost:5000")


@router.post("")
async def get_cart(authorization: str = Header(...)):
    """
    USUARIO AUTENTICADO

    - Recibe Authorization: Bearer <token>
    - Valida el token con Supabase
    - Obtiene user_id
    - Consulta el microservicio Cart vía POST
    """
    try:
        # Validar token y obtener user_id
        user_id = is_authenticated(authorization)

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{CART_SERVICE_URL}/cart", json={"user_id": user_id}
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail=response.json()
            )

        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503, detail=f"Cart service unavailable: {str(e)}"
        )


@router.post("/items")
async def add_to_cart(
    authorization: str = Header(...),
    body: dict = Body(...),
):
    """
    USUARIO AUTENTICADO

    Body esperado desde el cliente:
    {
        "product_id": int,
        "quantity": int (opcional, default = 1)
    }
    """
    try:
        # 1. Autenticación
        user_id = is_authenticated(authorization)

        product_id = body["product_id"]
        quantity = body.get("quantity", 1)

        # 2. Consultar microservicio Products
        async with httpx.AsyncClient(timeout=10.0) as client:
            product_response = await client.get(
                f"{PRODUCTS_SERVICE_URL}/products/{product_id}"
            )

        if product_response.status_code == 404:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        if product_response.status_code != 200:
            raise HTTPException(
                status_code=product_response.status_code, detail=product_response.text
            )

        product_data = product_response.json()

        # Estructura esperada desde Products
        # {
        #   "exito": true,
        #   "datos": {
        #       "id": int,
        #       "name": string,
        #       "price": float,
        #       "imageurl": string,
        #       "stock": int
        #   }
        # }

        product = product_data["datos"]

        # 3. Validar stock
        if quantity <= 0:
            raise HTTPException(
                status_code=400, detail="La cantidad debe ser mayor a cero"
            )

        if product.get("stock") is not None and quantity > product["stock"]:
            raise HTTPException(
                status_code=400, detail="Cantidad solicitada no disponible"
            )

        # 4. Construir snapshot confiable
        payload = {
            "user_id": user_id,
            "product_id": product["id"],
            "product_name": product["name"],
            "product_price": product["price"],
            "product_image_url": product["imageurl"],
            "quantity": quantity,
        }

        # 5. Enviar al microservicio Cart
        async with httpx.AsyncClient(timeout=10.0) as client:
            cart_response = await client.post(
                f"{CART_SERVICE_URL}/cart/add", json=payload
            )

        if cart_response.status_code != 200:
            raise HTTPException(
                status_code=cart_response.status_code, detail=cart_response.json()
            )

        return cart_response.json()

    except KeyError:
        raise HTTPException(status_code=400, detail="product_id es requerido")

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")


@router.delete("/items")
async def remove_from_cart(
    authorization: str = Header(...),
    body: dict = Body(...),
):
    """
    USUARIO AUTENTICADO

    Body esperado:
    {
        "product_id": int
    }
    """
    try:
        # Validar token y obtener user_id
        user_id = is_authenticated(authorization)

        payload = {
            "user_id": user_id,
            "product_id": body["product_id"],
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.delete(
                f"{CART_SERVICE_URL}/cart/remove",
                params=payload,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json(),
            )

        return response.json()

    except KeyError:
        raise HTTPException(
            status_code=400,
            detail="product_id es requerido",
        )

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Cart service unavailable: {str(e)}",
        )
