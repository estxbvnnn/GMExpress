import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const TAX_RATE = 0.19;

const getCartKey = (uid) => `cart_${uid}`;

const readCart = (uid) => {
	try {
		return JSON.parse(localStorage.getItem(getCartKey(uid)) || "[]");
	} catch {
		return [];
	}
};

const writeCart = (uid, data) => {
	localStorage.setItem(getCartKey(uid), JSON.stringify(data));
	localStorage.removeItem("cart");
};

const Cart = () => {
	const [items, setItems] = useState([]);
	const [sending, setSending] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();
	const normalizeRole = (value) => (value || "").toLowerCase();
	const userRole =
		normalizeRole(user?.role) || normalizeRole(user?.tipoUsuario) || "";
	const isCompanyUser = userRole === "empresa";

	const hydrateItemsWithOwner = async (list) => {
		const pending = list.filter(
			(item) => !item.ownerId || !item.categoriaId || !item.categoriaNombre
		);
		if (pending.length === 0) return list;

		const productIds = Array.from(new Set(pending.map((i) => i.id)));
		const metadata = {};
		await Promise.all(
			productIds.map(async (productId) => {
				try {
					const snap = await getDoc(doc(db, "productos", productId));
					if (snap.exists()) metadata[productId] = snap.data();
				} catch (err) {
					console.error("Cart -> error hidratando producto", productId, err);
				}
			})
		);

		return list.map((item) => {
			const data = metadata[item.id];
			if (!data) return item;
			return {
				...item,
				ownerId: item.ownerId || data.ownerId || null,
				ownerEmail: item.ownerEmail || data.ownerEmail || null,
				categoriaId: item.categoriaId || data.categoriaId || null,
				categoriaNombre: item.categoriaNombre || data.categoriaNombre || null,
			};
		});
	};

	useEffect(() => {
		const loadCart = async () => {
			if (!user) {
				setItems([]);
				return;
			}
			const stored = readCart(user.uid);
			const hydrated = await hydrateItemsWithOwner(stored);
			setItems(hydrated);
			writeCart(user.uid, hydrated);
			localStorage.removeItem("cart");
		};
		loadCart();
	}, [user]);

	const updateCart = (updated) => {
		setItems(updated);
		if (user) {
			writeCart(user.uid, updated);
		}
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

	const subtotal = items.reduce(
		(sum, i) => sum + (i.price || 0) * i.quantity,
		0
	);
	const tax = Math.round(subtotal * TAX_RATE);
	const total = subtotal + tax;

	const handleCreateOrder = async () => {
		if (!user) return;
		if (isCompanyUser) {
			Swal.fire(
				"Solo clientes",
				"Las cuentas de empresa no utilizan carrito. Revisa tus solicitudes en la sección dedicada.",
				"info"
			);
			return;
		}
		if (items.length === 0) {
			Swal.fire("Carrito vacío", "No hay productos en el carrito.", "info");
			return;
		}
		try {
			setSending(true);
			const orderItems = items.map((i) => ({
				productId: i.id,
				ownerId: i.ownerId || null,
				ownerEmail: i.ownerEmail || null,
				categoriaId: i.categoriaId || null,
				categoriaNombre: i.categoriaNombre || null,
				name: i.name,
				quantity: i.quantity,
				price: i.price,
			}));
			const ownersInvolved = Array.from(
				new Set(orderItems.map((i) => i.ownerId).filter(Boolean))
			);
			const payload = {
				userId: user.uid,
				clientName: user.nombre
					? `${user.nombre} ${user.apellidoPaterno || ""}`.trim()
					: user.displayName || null,
				userEmail: user.email || null,
				items: orderItems,
				subtotal,
				tax,
				taxRate: TAX_RATE,
				total,
				ownersInvolved,
				status: "pendiente",
				createdAt: serverTimestamp(),
			};
			console.log("Cart -> creando order con payload", payload);
			await addDoc(collection(db, "orders"), payload);

			localStorage.removeItem(getCartKey(user.uid));
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

	const cartStyles = {
		wrapper: { display: "flex", flexDirection: "column", gap: 20 },
		card: {
			background: "#fff",
			borderRadius: 28,
			boxShadow: "0 30px 60px rgba(8,40,28,0.12)",
			padding: 28,
			border: "1px solid rgba(9,72,40,0.08)",
		},
		emptyCard: {
			background: "#f4f9f6",
			borderRadius: 24,
			padding: 32,
			textAlign: "center",
			color: "#4c5f55",
		},
		table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" },
		summaryBox: {
			display: "flex",
			flexDirection: "column",
			gap: 12,
			padding: 24,
			borderRadius: 20,
			background: "#042f1b",
			color: "#fff",
			boxShadow: "0 20px 45px rgba(4,32,20,0.3)",
		},
		summaryRow: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			fontSize: "1rem",
		},
		primaryBtn: {
			borderRadius: 999,
			padding: "12px 28px",
			border: "none",
			background: "linear-gradient(120deg,#34d593,#0ea164)",
			color: "#031c10",
			fontWeight: 600,
			boxShadow: "0 18px 28px rgba(3,37,20,0.25)",
			cursor: "pointer",
		},
		linkBtn: {
			borderRadius: 999,
			padding: "12px 24px",
			border: "1px solid #0d6a41",
			background: "transparent",
			color: "#0d6a41",
			fontWeight: 600,
			cursor: "pointer",
		},
	};

	if (isCompanyUser) {
		return (
			<div className="page-container" style={cartStyles.wrapper}>
				<div style={cartStyles.emptyCard}>
					<h1>Carrito de Compra</h1>
					<p>
						Las cuentas de empresa no gestionan compras desde el carrito. Dirígete a la sección de
						solicitudes para revisar los pedidos de tus clientes.
					</p>
					<button style={cartStyles.linkBtn} onClick={() => navigate("/mis-pedidos")}>
						Ver solicitudes de clientes
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="page-container" style={cartStyles.wrapper}>
			<h1>Carrito de Compra</h1>
			{items.length === 0 ? (
				<div style={cartStyles.emptyCard}>No hay productos en el carrito.</div>
			) : (
				<>
					<div style={cartStyles.card}>
						<table style={cartStyles.table}>
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
					</div>
					<div style={cartStyles.summaryBox}>
						<div style={cartStyles.summaryRow}>
							<span>Subtotal neto</span>
							<strong>${subtotal.toLocaleString("es-CL")}</strong>
						</div>
						<div style={cartStyles.summaryRow}>
							<span>IVA 19%</span>
							<strong>${tax.toLocaleString("es-CL")}</strong>
						</div>
						<hr style={{ borderColor: "rgba(255,255,255,0.2)" }} />
						<div style={{ ...cartStyles.summaryRow, fontSize: "1.1rem" }}>
							<span>Total con IVA</span>
							<strong>${total.toLocaleString("es-CL")}</strong>
						</div>
						<button style={cartStyles.primaryBtn} onClick={handleCreateOrder} disabled={sending}>
							{sending ? "Enviando..." : "Generar solicitud de venta"}
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default Cart;