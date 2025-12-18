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


@app.route("/orders", methods=["POST"])
def create_order():
    """
    Payload esperado:
    {
      "user_id": "uuid",
      "items": [
        {
          "product_id": 1,
          "product_name": "Product X",
          "quantity": 2,
          "price": 199.99
        }
      ]
    }
    """
    data = request.get_json()

    user_id = data.get("user_id")
    items = data.get("items", [])
    print("ITEMS RECEIVED:", items)

    if not user_id or not items:
        return jsonify({
            "error": "Invalid payload"
        }), 400

    # 1️⃣ Calcular total
    try:
        total_price = sum(
            item["product_price"] * item["quantity"]
            for item in items
        )
    except KeyError:
        return jsonify({
            "error": "Invalid item format"
        }), 400

    # 2️⃣ Crear orden
    order_response = supabase.table("orders").insert({
        "user_id": user_id,
        "total_price": total_price,
        "status": "pending"
    }).execute()

    if not order_response.data:
        return jsonify({
            "error": "Failed to create order"
        }), 500

    order_id = order_response.data[0]["id"]

    # 3️⃣ Crear items
    order_items = []

    for item in items:
        order_items.append({
            "order_id": order_id,
            "product_id": item["product_id"],
            "product_name": item.get("product_name"),
            "quantity": item["quantity"],
            "price": item["product_price"]
        })

    supabase.table("order_items").insert(order_items).execute()

    return jsonify({
        "order_id": order_id,
        "message": "Order created successfully"
    }), 201


@app.route("/check-pending", methods=["GET"])
def check_pending_order():
    """
    Params:
    - user_id (UUID)

    Response:
    {
      "has_pending": true | false,
      "order": {
          ...,
          "order_items": [...]
      } | null
    }
    """
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({
            "error": "user_id is required"
        }), 400

    response = (
        supabase
        .table("orders")
        .select("""
            id,
            user_id,
            status,
            total_price,
            created_at,
            order_items (
                id,
                product_id,
                product_name,
                quantity,
                price
            )
        """)
        .eq("user_id", user_id)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    has_pending = len(response.data) > 0

    return jsonify({
        "has_pending": has_pending,
        "order": response.data[0] if has_pending else None
    }), 200


@app.route("/orderslist", methods=["GET"])
def list_orders():
    """
    Params:
    - user_id (UUID)
    - role (string) - "admin" o "user"

    Response:
    [
      {
        "id": 1,
        "user_id": "uuid",
        "total_price": 399.98,
        "status": "pending",
        "created_at": "2024-10-01T12:34:56Z"
      }
    ]
    """
    user_id = request.args.get("user_id")
    role = request.args.get("role")
    if not user_id :
        return jsonify({
            "error": "user_id and role are required"
        }), 400
    if role == "admin":
        response = (
        supabase
        .table("orders")
        .select("""
            id,
            user_id,
            status,
            total_price,
            created_at,
            shipping_address,
            order_items (
                id,
                product_id,
                product_name,
                quantity,
                price
            )
        """)
        .order("created_at", desc=True)
        .execute()
    )
    else:
        response = (
            supabase
            .table("orders")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
            )

    print("ORDERS FETCHED:", response.data)
    return jsonify(response.data), 200

@app.route("/orders/<int:order_id>", methods=["PATCH"])
def update_order(order_id):
    """
    Body:
    {
      "status": "completed" | "cancelled" | ...
    }
    """
    data = request.get_json()
    status = data.get("status")

    if not status:
        return jsonify({"error": "status is required"}), 400

    response = (
        supabase
        .table("orders")
        .update({"status": status})
        .eq("id", order_id)
        .execute()
    )

    if not response.data:
        return jsonify({"error": "Order not found"}), 404

    return jsonify({
        "message": "Order updated",
        "order_id": order_id,
        "status": status
    }), 200


@app.route("/address/<int:order_id>", methods=["PATCH"])
def add_address_to_order(order_id):
    """
    Agrega la dirección a una orden existente.
    
    Body:
    {
      "address": "Calle Principal 123, Apto 4B, Ciudad, País, CP 12345"
    }
    """
    data = request.get_json()
    address = data.get("address")

    if not address:
        return jsonify({"error": "address is required"}), 400

    response = (
        supabase
        .table("orders")
        .update({"shipping_address": address})
        .eq("id", order_id)
        .execute()
    )

    if not response.data:
        return jsonify({"error": "Order not found"}), 404

    return jsonify({
        "message": "Address added successfully",
        "order_id": order_id,
        "address": address
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)