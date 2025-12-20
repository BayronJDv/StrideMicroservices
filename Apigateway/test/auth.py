import os
from supabase import create_client

_supabase = create_client(
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("VITE_SUPABASE_ANON_KEY")
)

_session = None


def get_auth_headers():
    global _session

    if _session is None:
        response = _supabase.auth.sign_in_with_password({
            "email": os.getenv("TEST_GMAIL"),
            "password": os.getenv("TEST_PASSWORD")
        })

        if response.session is None:
            raise RuntimeError("Fallo autenticación usuario de test")

        _session = response.session

    return {
        "Authorization": f"Bearer {_session.access_token}"
    }
