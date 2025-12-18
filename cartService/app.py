from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import supabase

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/health")
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route("/cart", methods=["POST"])
def get_cart():
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"exito": False, "error": "Se requiere user_id"}), 400

        response = (
            supabase.table("cart_items").select("*").eq("user_id", user_id).execute()
        )

        return jsonify({"exito": True, "user_id": user_id, "items": response.data}), 200

    except Exception as e:
        return jsonify({"exito": False, "error": str(e)}), 500


@app.route("/cart/add", methods=["POST"])
def add_to_cart():
    try:
        data = request.get_json()

        required_fields = [
            "user_id",
            "product_id",
            "product_name",
            "product_image_url",
            "product_price",
            "quantity",
        ]

        if not data or not all(field in data for field in required_fields):
            return jsonify({"exito": False, "error": "Datos incompletos"}), 400

        # Verificar si el producto ya existe en el carrito
        existing = (
            supabase.table("cart_items")
            .select("quantity")
            .eq("user_id", data["user_id"])
            .eq("product_id", data["product_id"])
            .execute()
        )

        if len(existing.data) > 0:
            # Actualizar cantidad
            new_qty = existing.data[0]["quantity"] + data["quantity"]

            supabase.table("cart_items").update({"quantity": new_qty}).eq(
                "user_id", data["user_id"]
            ).eq("product_id", data["product_id"]).execute()
        else:
            # Insertar nuevo item
            supabase.table("cart_items").insert(
                {
                    "user_id": data["user_id"],
                    "product_id": data["product_id"],
                    "product_name": data["product_name"],
                    "product_image_url": data["product_image_url"],
                    "product_price": data["product_price"],
                    "quantity": data["quantity"],
                }
            ).execute()

        return jsonify({"exito": True, "mensaje": "Producto agregado al carrito"}), 200

    except Exception as e:
        return jsonify({"exito": False, "error": str(e)}), 500


@app.route("/cart/update", methods=["PUT"])
def update_cart_item():
    try:
        data = request.get_json()

        if (
            not data
            or "user_id" not in data
            or "product_id" not in data
            or "quantity" not in data
        ):
            return jsonify({"exito": False, "error": "Datos incompletos"}), 400

        if data["quantity"] <= 0:
            return jsonify(
                {"exito": False, "error": "La cantidad debe ser mayor a cero"}
            ), 400

        response = (
            supabase.table("cart_items")
            .update({"quantity": data["quantity"]})
            .eq("user_id", data["user_id"])
            .eq("product_id", data["product_id"])
            .execute()
        )

        if len(response.data) == 0:
            return jsonify(
                {"exito": False, "error": "Producto no encontrado en el carrito"}
            ), 404

        return jsonify({"exito": True, "mensaje": "Cantidad actualizada"}), 200

    except Exception as e:
        return jsonify({"exito": False, "error": str(e)}), 500


@app.route("/cart/remove", methods=["DELETE"])
def remove_cart_item():
    try:
        user_id = request.args.get("user_id")
        product_id = request.args.get("product_id")

        print(f"user_id: {user_id}")
        print(f"product_id: {product_id}")

        if not user_id or not product_id:
            return jsonify(
                {
                    "exito": False,
                    "error": "Parámetros incompletos. Se requieren user_id y product_id",
                }
            ), 400

        supabase.table("cart_items").delete().eq("user_id", user_id).eq(
            "product_id", product_id
        ).execute()

        return jsonify(
            {"exito": True, "mensaje": "Producto eliminado del carrito"}
        ), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"exito": False, "error": str(e)}), 500

@app.route("/cart/clear", methods=["POST"])
def clear_cart():
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"exito": False, "error": "Se requiere user_id"}), 400

        supabase.table("cart_items").delete().eq("user_id", user_id).execute()

        return jsonify({"exito": True, "mensaje": "Carrito vaciado"}), 200

    except Exception as e:
        return jsonify({"exito": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
