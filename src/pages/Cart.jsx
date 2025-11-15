import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Cart = () => {
	const [items, setItems] = useState([]);
	const [sending, setSending] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const stored = JSON.parse(localStorage.getItem("cart") || "[]");
		setItems(stored);
	}, []);

	const updateCart = (updated) => {
		setItems(updated);
		localStorage.setItem("cart", JSON.stringify(updated));
	};

	const handleQuantity = (id, delta) => {
		const updated = items
			.map((i) =>
				i.id === id ? { ...i, quantity: i.quantity + delta } : i
			)
			.filter((i) => i.quantity > 0);
		updateCart(updated);
	};

	const handleRemove = (id) => {
		const updated = items.filter((i) => i.id !== id);
		updateCart(updated);
	};

	const total = items.reduce(
		(sum, i) => sum + (i.price || 0) * i.quantity,
		0
	);

	const handleCreateOrder = async () => {
		if (!user) return;
		if (items.length === 0) {
			Swal.fire("Carrito vacío", "No hay productos en el carrito.", "info");
			return;
		}
		try {
			setSending(true);
			const payload = {
				userId: user.uid,
				clientName: user.nombre
					? `${user.nombre} ${user.apellidoPaterno || ""}`.trim()
					: user.displayName || null,
				userEmail: user.email || null,
				items: items.map((i) => ({
					productId: i.id,
					name: i.name,
					quantity: i.quantity,
					price: i.price,
				})),
				total,
				status: "pendiente",
				createdAt: serverTimestamp(),
			};
			console.log("Cart -> creando order con payload", payload);
			await addDoc(collection(db, "orders"), payload);

			// ...existing limpiar carrito + Swal + navigate...
			localStorage.removeItem("cart");
			setItems([]);
			await Swal.fire(
				"Solicitud enviada",
				"Tu solicitud de venta fue enviada correctamente.",
				"success"
			);
			navigate("/mis-pedidos");
		} catch (err) {
			console.error("Error creando order:", err);
			Swal.fire(
				"Error",
				"Error al generar la solicitud. Intenta nuevamente.",
				"error"
			);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="page-container">
			<h1>Carrito de Compra</h1>
			{items.length === 0 ? (
				<p>No hay productos en el carrito.</p>
			) : (
				<>
					<table className="cart-table">
						<thead>
							<tr>
								<th>Producto</th>
								<th>Cantidad</th>
								<th>Precio</th>
								<th>Subtotal</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{items.map((i) => (
								<tr key={i.id}>
									<td>{i.name}</td>
									<td>
										<button
											className="btn-qty"
											onClick={() => handleQuantity(i.id, -1)}
										>
											-
										</button>
										<span>{i.quantity}</span>
										<button
											className="btn-qty"
											onClick={() => handleQuantity(i.id, 1)}
										>
											+
										</button>
									</td>
									<td>${i.price?.toLocaleString("es-CL")}</td>
									<td>
										$
										{(i.price * i.quantity).toLocaleString("es-CL")}
									</td>
									<td>
										<button
											className="btn-table-danger"
											onClick={() => handleRemove(i.id)}
										>
											Eliminar
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="cart-summary">
						<p>Total: ${total.toLocaleString("es-CL")}</p>
						<button
							className="btn-primary"
							onClick={handleCreateOrder}
							disabled={sending}
						>
							{sending ? "Enviando..." : "Generar solicitud de venta"}
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default Cart;