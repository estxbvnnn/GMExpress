import { useEffect, useState } from "react";
import {
	collection,
	getDocs,
	query,
	where,
	orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const q = query(
					collection(db, "orders"),
					where("userId", "==", user.uid),
					orderBy("createdAt", "desc")
				);
				const snap = await getDocs(q);
				const data = snap.docs.map((d) => ({
					id: d.id,
					...d.data(),
				}));
				setOrders(data);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [user.uid]);

	if (loading) return <div className="page-container">Cargando pedidos...</div>;

	return (
		<div className="page-container">
			<h1>Mis Solicitudes de Venta</h1>
			{orders.length === 0 ? (
				<p>No tienes solicitudes registradas.</p>
			) : (
				<div className="orders-list">
					{orders.map((o) => (
						<div key={o.id} className="order-card">
							<p>
								<b>ID:</b> {o.id}
							</p>
							<p>
								<b>Estado:</b> {o.status}
							</p>
							<p>
								<b>Total:</b> ${o.total?.toLocaleString("es-CL")}
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