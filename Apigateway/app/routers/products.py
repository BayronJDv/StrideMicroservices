import os
from typing import Optional
import os 
import httpx
from fastapi import APIRouter, HTTPException, Path, Query

router = APIRouter(prefix="/products", tags=["Products"])

PRODUCTS_SERVICE_URL = os.getenv("PRODUCTS_SERVICE_URL", "http://localhost:5000")

@router.get("/search")
async def search_products(
    category: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    page: int = Query(1),
    page_size: int = Query(8),
):
    params = {
        "category": category,
        "keyword": keyword,
        "min_price": min_price,
        "max_price": max_price,
        "page": page,
        "page_size": page_size,
    }

    # Elimina los parámetros None para no enviarlos
    params = {k: v for k, v in params.items() if v is not None}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{PRODUCTS_SERVICE_URL}/products/search",
                params=params,
            )

        # Si el microservicio responde con error
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, detail=response.json()
            )

        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503, detail=f"Products service unavailable: {str(e)}"
        )


@router.get("/{product_id}")
async def get_product_detail(product_id: int = Path(..., gt=0)):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{PRODUCTS_SERVICE_URL}/products/{product_id}")

        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        print(response.json())
        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503, detail=f"Products service unavailable: {str(e)}"
        )
