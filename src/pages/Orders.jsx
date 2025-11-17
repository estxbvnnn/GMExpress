import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [updatingOrderId, setUpdatingOrderId] = useState(null);
	const normalizeRole = (value) => (value || "").toLowerCase();
	const userRole =
		normalizeRole(user?.role) || normalizeRole(user?.tipoUsuario) || "";
	const isCompanyUser = userRole === "empresa";

	useEffect(() => {
		if (!user) return;
		const load = async () => {
			try {
				setLoading(true);
				const userOrdersPromise = getDocs(
					query(collection(db, "orders"), where("userId", "==", user.uid))
				);
				const ownerOrdersPromise = isCompanyUser
					? getDocs(
							query(
								collection(db, "orders"),
								where("ownersInvolved", "array-contains", user.uid)
							)
					  )
					: Promise.resolve(null);

				const [userOrdersSnap, ownerOrdersSnap] = await Promise.all([
					userOrdersPromise,
					ownerOrdersPromise,
				]);

				const toMillis = (ts) =>
					ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);

				const mergedMap = new Map();
				const appendDocs = (snap) => {
					if (!snap) return;
					snap.docs.forEach((d) => mergedMap.set(d.id, { id: d.id, ...d.data() }));
				};

				appendDocs(userOrdersSnap);
				appendDocs(ownerOrdersSnap);

				const merged = Array.from(mergedMap.values()).sort(
					(a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)
				);
				setOrders(merged);
			} catch (e) {
				console.error("Orders -> error cargando pedidos:", e);
				setOrders([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [user, isCompanyUser]);

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

	const processedOrders = orders.reduce((acc, order) => {
		const viewerItems = isCompanyUser
			? (order.items || []).filter((it) => it.ownerId === user.uid)
			: order.items || [];
		if (isCompanyUser && viewerItems.length === 0) return acc;

		const viewerTotal = isCompanyUser
			? viewerItems.reduce(
					(sum, it) => sum + (it.price || 0) * (it.quantity || 0),
					0
			  )
			: order.total || 0;

		acc.push({ ...order, viewerItems, viewerTotal });
		return acc;
	}, []);

	const totalGlobal = processedOrders.reduce(
		(sum, o) => sum + (o.viewerTotal || 0),
		0
	);

	const companyClientSummary = isCompanyUser
		? Array.from(
				processedOrders.reduce((map, order) => {
					const key = order.userId || "sin-id";
					const current = map.get(key) || {
						userId: order.userId || "sin-id",
						clientName: order.clientName || order.userEmail || "Cliente sin nombre",
						requests: 0,
						total: 0,
					};
					current.requests += 1;
					current.total += order.viewerTotal || 0;
					map.set(key, current);
					return map;
				}, new Map()).values()
		  )
		: [];

	const handleUpdateOrderStatus = async (orderId, newStatus) => {
		if (!orderId || !newStatus) return;
		try {
			setUpdatingOrderId(orderId);
			await updateDoc(doc(db, "orders", orderId), { status: newStatus });
			setOrders((prev) =>
				prev.map((order) =>
					order.id === orderId ? { ...order, status: newStatus } : order
				)
			);
		} catch (err) {
			console.error("Orders -> no se pudo actualizar el estado:", err);
			alert("No se pudo actualizar el estado. Intenta nuevamente.");
		} finally {
			setUpdatingOrderId(null);
		}
	};

	return (
		<div className="page-container">
			<h1>
				{isCompanyUser ? "Solicitudes de mis clientes" : "Mis Solicitudes de Venta"}
			</h1>
			<p style={{ fontSize: "0.9rem", color: "#666", marginTop: 0 }}>
				Aquí puedes ver todas las solicitudes que has enviado a GM Express,
				junto a su estado actual (pendiente, aceptada/en proceso, entregada o
				rechazada).
			</p>
			{processedOrders.length > 0 && (
				<p style={{ fontSize: "0.9rem", marginBottom: 8 }}>
					<b>Total solicitudes:</b> {processedOrders.length} ·{" "}
					<b>
						{isCompanyUser ? "Monto asociado a tus productos" : "Monto acumulado"}:
					</b>{" "}
					${totalGlobal.toLocaleString("es-CL")}
				</p>
			)}

			{isCompanyUser && companyClientSummary.length > 0 && (
				<div className="orders-summary-table">
					<h3>Solicitudes por cliente</h3>
					<table className="cart-table">
						<thead>
							<tr>
								<th>Cliente</th>
								<th>Solicitudes</th>
								<th>Total asociado</th>
							</tr>
						</thead>
						<tbody>
							{companyClientSummary.map((row) => (
								<tr key={row.userId}>
									<td>{row.clientName}</td>
									<td>{row.requests}</td>
									<td>${row.total.toLocaleString("es-CL")}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{processedOrders.length === 0 ? (
				<p>
					{isCompanyUser
						? "No hay solicitudes para tus productos todavía."
						: "No tienes solicitudes registradas."}
				</p>
			) : (
				<div className="orders-list">
					{processedOrders.map((o) => (
						<div key={o.id} className="order-card">
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
								<b>Total {isCompanyUser ? "para tu empresa" : ""}:</b> $
								{o.viewerTotal.toLocaleString("es-CL")}
							</p>
							<p>
								<b>
									{isCompanyUser
										? "Productos asociados a tu empresa:"
										: "Detalle de productos:"}
								</b>
							</p>
							<ul>
								{o.viewerItems?.map((it, idx) => (
									<li key={idx}>
										{it.name} x {it.quantity} (${it.price?.toLocaleString("es-CL")})
									</li>
								))}
							</ul>
							{isCompanyUser && (
								<div className="order-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
									<button
										className="btn-secondary"
										disabled={updatingOrderId === o.id || o.status === "proceso"}
										onClick={() => handleUpdateOrderStatus(o.id, "proceso")}
									>
										{updatingOrderId === o.id && o.status !== "proceso"
											? "Actualizando..."
											: "Aceptar solicitud"}
									</button>
									<button
										className="btn-table-danger"
										disabled={updatingOrderId === o.id || o.status === "cancelado"}
										onClick={() => handleUpdateOrderStatus(o.id, "cancelado")}
									>
										Rechazar
									</button>
									<button
										className="btn-primary"
										disabled={updatingOrderId === o.id || o.status === "entregado"}
										onClick={() => handleUpdateOrderStatus(o.id, "entregado")}
									>
										Marcar como entregado
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Orders;