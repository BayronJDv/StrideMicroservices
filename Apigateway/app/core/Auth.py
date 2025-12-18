from fastapi import HTTPException

from .config import supabase


# Funcion para verificar si el usuario esta autenticado
# devuelve el ide del usuario si esta autenticado
def is_authenticated(authorization):
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    # Extraer token (quitar "Bearer ")
    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido")

def is_admin(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    role_response = (
        supabase
        .table('roles')
        .select('role')
        .eq('id', user.user.id)
        .execute()
    )

    # 🔹 NO tiene registro en roles
    if not role_response.data:
        return "user"

    # 🔹 Tiene rol
    if role_response.data[0]['role'] == 'admin':
        return "admin"

    raise HTTPException(status_code=403, detail="Acceso denegado")

def get_email(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        return user.user.email
    except Exception:
        raise HTTPException(status_code=401, detail="no se obtuvo el email desde la base de datos")