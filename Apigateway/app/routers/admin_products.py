from fastapi import APIRouter, Header, Path, HTTPException
from ..core.Auth import is_authenticated, is_admin
import httpx
import os 

PRODUCTS_SERVICE_URL = os.getenv("PRODUCTS_SERVICE_URL", "http://localhost:5000")

router = APIRouter(
    prefix="/admin/products",
    tags=["Admin Products"]
)

@router.get("/getall")
async def admin_get_products(
    authorization: str = Header(...)):
    """
    SOLO ADMIN

    Devuelve:
    - Lista completa de productos
    """
    print("peticion admin_get_products recibida")
    role = is_admin(authorization)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{PRODUCTS_SERVICE_URL}/allproducts"
            )
        print("Response from product service:", response)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

# crear un producto 
@router.post("/add")
async def admin_create_product(
    authorization: str = Header(...),
    product_data: dict = None
):
    role = is_admin(authorization)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{PRODUCTS_SERVICE_URL}/add",
                json=product_data
            )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}")
async def admin_get_product(
    product_id: int = Path(...),
    authorization: str = Header(...)
):
    """
    SOLO ADMIN

    Devuelve:
    - Producto específico
    """
    pass


@router.post("")
async def admin_create_product(
    authorization: str = Header(...)
):
    """
    SOLO ADMIN

    Body:
    - Datos del producto

    Devuelve:
    - Producto creado
    """
    pass


@router.put("/edit/{product_id}")
async def admin_update_product(
    product_id: int = Path(...),
    authorization: str = Header(...),
    product_data: dict = None
):
    """
    SOLO ADMIN

    Body:
    - Campos parciales del producto

    Devuelve:
    - Producto actualizado
    """
    role = is_admin(authorization,)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.put(
                f"{PRODUCTS_SERVICE_URL}/edit/{product_id}",
                json=product_data
            )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{product_id}")
async def admin_delete_product(
    product_id: int = Path(...),
    authorization: str = Header(...)
):
    """
    SOLO ADMIN

    Devuelve:
    - Mensaje de confirmación
    """

    role = is_admin(authorization)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.delete(
                f"{PRODUCTS_SERVICE_URL}/delete/{product_id}",
            )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
