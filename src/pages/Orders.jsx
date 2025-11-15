import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) return;
		const load = async () => {
			try {
				setLoading(true);
				console.log("Orders -> consultando orders para userId", user.uid);

				// IMPORTANTE: aquí usamos el mismo campo que se guarda en Cart.jsx: userId
				const q = query(
					collection(db, "orders"),
					where("userId", "==", user.uid)
					// puedes volver a agregar orderBy("createdAt","desc") cuando definas el índice
				);

				const snap = await getDocs(q);
				const data = snap.docs.map((d) => ({
					id: d.id,
					...d.data(),
				}));
				console.log("Orders -> pedidos cargados:", data.length, data);
				setOrders(data);
			} catch (e) {
				console.error("Orders -> error cargando pedidos:", e);
				setOrders([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [user]);

	if (!user) {
		return (
			<div className="page-container">
				<p>Debes iniciar sesión para ver tus pedidos.</p>
			</div>
		);
	}

	if (loading) return <div className="page-container">Cargando pedidos...</div>;

	const formatDateTime = (ts) => {
		if (!ts || !ts.toDate) return "-";
		return ts.toDate().toLocaleString("es-CL");
	};

	const mapStatusLabel = (status) => {
		switch (status) {
			case "pendiente":
				return "Pendiente (en revisión)";
			case "proceso":
				return "Aceptado (en proceso)";
			case "entregado":
				return "Entregado";
			case "cancelado":
				return "Rechazado / Cancelado";
			default:
				return status || "Sin estado";
		}
	};

	const mapStatusClass = (status) => {
		switch (status) {
			case "pendiente":
				return "status-tag status-pendiente";
			case "proceso":
				return "status-tag status-proceso";
			case "entregado":
				return "status-tag status-entregado";
			case "cancelado":
				return "status-tag status-pendiente";
			default:
				return "status-tag";
		}
	};

	const totalGlobal = orders.reduce((sum, o) => sum + (o.total || 0), 0);

	return (
		<div className="page-container">
			<h1>Mis Solicitudes de Venta</h1>
			<p style={{ fontSize: "0.9rem", color: "#666", marginTop: 0 }}>
				Aquí puedes ver todas las solicitudes que has enviado a GM Express,
				junto a su estado actual (pendiente, aceptada/en proceso, entregada o
				rechazada).
			</p>
			{orders.length > 0 && (
				<p style={{ fontSize: "0.9rem", marginBottom: 8 }}>
					<b>Total solicitudes:</b> {orders.length} ·{" "}
					<b>Monto acumulado:</b> $
					{totalGlobal.toLocaleString("es-CL")}
				</p>
			)}

			{orders.length === 0 ? (
				<p>No tienes solicitudes registradas.</p>
			) : (
				<div className="orders-list">
					{orders.map((o) => (
						<div key={o.id} className="order-card">
							{/* ID oculto: si lo necesitas para debug, puedes dejarlo como comentario */}
							{/*
							<p>
								<b>ID:</b> {o.id}
							</p>
							*/}
							<p>
								<b>Fecha:</b> {formatDateTime(o.createdAt)}
							</p>
							<p>
								<b>Estado:</b>{" "}
								<span className={mapStatusClass(o.status)}>
									{mapStatusLabel(o.status)}
								</span>
							</p>
							<p>
								<b>Total:</b> ${o.total?.toLocaleString("es-CL")}
							</p>
							<p>
								<b>Detalle de productos:</b>
							</p>
							<ul>
								{o.items?.map((it, idx) => (
									<li key={idx}>
										{it.name} x {it.quantity} (${it.price?.toLocaleString(
											"es-CL"
										)}
										)
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Orders;