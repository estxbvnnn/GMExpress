import { useEffect, useState } from "react";
import {
	collection,
	getDocs,
	query,
	orderBy,
	updateDoc,
	doc,
	deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const AdminPanel = () => {
	const { user } = useAuth();
	const [activeSection, setActiveSection] = useState("dashboard");
	const [orders, setOrders] = useState([]);
	const [products, setProducts] = useState([]);
	const [usersList, setUsersList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [savingOrder, setSavingOrder] = useState(false);
	const [savingUser, setSavingUser] = useState(false);
	const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);
	const [editingUserId, setEditingUserId] = useState(null);
	const [editUserForm, setEditUserForm] = useState({
		nombre: "",
		apellidoPaterno: "",
		apellidoMaterno: "",
		tipoUsuario: "Cliente",
		role: "cliente",
		email: "",
	});
	const [selectedCatalogCategory, setSelectedCatalogCategory] = useState("TODAS");

	// filtros reportes
	const [reportFrom, setReportFrom] = useState("");
	const [reportTo, setReportTo] = useState("");
	const [reportChannel, setReportChannel] = useState("TODOS");
	const [reportCategory, setReportCategory] = useState("TODAS");
	const [reportRequested, setReportRequested] = useState(false);

	const loadData = async () => {
		setLoading(true);
		try {
			console.log("AdminPanel: cargando datos para usuario:", user?.uid, user?.role);

			const ordersSnap = await getDocs(
				query(collection(db, "orders"), orderBy("createdAt", "desc"))
			);
			const ordersData = ordersSnap.docs.map((d) => ({
				id: d.id,
				...d.data(),
			}));

			const prodSnap = await getDocs(collection(db, "productos"));
			const prodData = prodSnap.docs.map((d) => ({
				id: d.id,
				...d.data(),
			}));

			const usersSnap = await getDocs(collection(db, "usuarios"));
			const usersData = usersSnap.docs.map((d) => ({
				id: d.id,
				...d.data(),
			}));

			setOrders(ordersData);
			setProducts(prodData);
			setUsersList(usersData);
		} catch (err) {
			console.error("Error cargando datos admin:", err);
			Swal.fire(
				"Error",
				err.message || "No se pudieron cargar los datos del panel.",
				"error"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user && user.role === "superadmin") {
			loadData();
		}
	}, [user]);

	// Si por alguna razón llega aquí alguien que no es superadmin, muestra aviso
	if (!user || user.role !== "superadmin") {
		return (
			<div className="page-container">
				<h1>Admin Panel</h1>
				<p>No tienes permisos para ver esta sección.</p>
			</div>
		);
	}

	const isSameMonth = (ts) => {
		if (!ts || !ts.toDate) return false;
		const d = ts.toDate();
		const now = new Date();
		return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
	};

	// KPIs
	const nuevasSolicitudes = orders.filter((o) => o.status === "pendiente").length;

	const ventasMes = orders
		.filter((o) => o.status === "entregado" && isSameMonth(o.createdAt))
		.reduce((sum, o) => sum + (o.total || 0), 0);

	const productosActivos = products.filter((p) => p.active !== false).length;

	const formatMoney = (n) => `$${(n || 0).toLocaleString("es-CL")}`;

	const formatDateTime = (ts) => {
		if (!ts || !ts.toDate) return "-";
		const d = ts.toDate();
		return d.toLocaleString("es-CL");
	};

	const mapStatusTag = (status) => {
		switch (status) {
			case "pendiente":
				return (
					<span className="status-tag status-pendiente">PENDIENTE</span>
				);
			case "proceso":
				return (
					<span className="status-tag status-proceso">EN PROCESO</span>
				);
			case "entregado":
				return (
					<span className="status-tag status-entregado">ENTREGADO</span>
				);
			default:
				return <span className="status-tag">{status || "-"}</span>;
		}
	};

	const handleChangeOrderStatus = async (orderId, newStatus) => {
		if (!newStatus) return;
		const order = orders.find((o) => o.id === orderId);
		if (!order) return;
		const prevStatus = order.status;

		const confirm = await Swal.fire({
			title: "Actualizar estado",
			text: `¿Cambiar estado de ${order.id} de "${prevStatus || "-"}" a "${newStatus}"?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Sí, actualizar",
			cancelButtonText: "Cancelar",
		});
		if (!confirm.isConfirmed) return;

		try {
			setSavingOrder(true);
			await updateDoc(doc(db, "orders", orderId), {
				status: newStatus,
			});
			// actualizar en memoria
			setOrders((prev) =>
				prev.map((o) =>
					o.id === orderId ? { ...o, status: newStatus } : o
				)
			);
			Swal.fire(
				"Actualizado",
				"El estado del pedido fue actualizado.",
				"success"
			);
		} catch (err) {
			console.error("Error actualizando estado pedido:", err);
			Swal.fire(
				"Error",
				"No se pudo actualizar el estado del pedido.",
				"error"
			);
		} finally {
			setSavingOrder(false);
		}
	};

	const openOrderInfo = (order) => setSelectedOrderInfo(order);
	const closeOrderInfo = () => setSelectedOrderInfo(null);

	// vistas por sección
	const renderDashboard = () => (
		<>
			<h1>Gestión de Solicitudes y Ventas</h1>
			<div className="kpis">
				<div className="kpi-card kpi-alert">
					<h3>Nuevas solicitudes</h3>
					<p>{nuevasSolicitudes}</p>
				</div>
				<div className="kpi-card kpi-success">
					<h3>Ventas del mes</h3>
					<p>{formatMoney(ventasMes)}</p>
				</div>
				<div className="kpi-card kpi-primary">
					<h3>Productos activos</h3>
					<p>{productosActivos}</p>
				</div>
			</div>

			<h2>Últimos pedidos</h2>
			{orders.length === 0 ? (
				<p>No hay pedidos registrados.</p>
			) : (
				<table className="admin-table admin-table-wide">
					<thead>
						<tr>
							<th>ID</th>
							<th>Cliente</th>
							<th>Fecha</th>
							<th>Total</th>
							<th>Estado</th>
						</tr>
					</thead>
					<tbody>
						{orders.slice(0, 10).map((o) => (
							<tr key={o.id}>
								<td>{o.id}</td>
								<td>{o.clientName || o.userEmail || "-"}</td>
								<td>{formatDateTime(o.createdAt)}</td>
								<td>{formatMoney(o.total)}</td>
								<td>{mapStatusTag(o.status)}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);

	const renderOrders = () => (
		<>
			<h1>Gestión de pedidos</h1>
			{orders.length === 0 ? (
				<p>No hay pedidos registrados.</p>
			) : (
				<>
					<table className="admin-table admin-table-wide">
						<thead>
							<tr>
								<th>ID</th>
								<th>Cliente</th>
								<th>Fecha</th>
								<th>Total</th>
								<th>Estado</th>
								<th>Cambiar estado</th>
								<th>Detalle</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((o) => (
								<tr key={o.id}>
									<td>{o.id}</td>
									<td>{o.clientName || o.userEmail || "-"}</td>
									<td>{formatDateTime(o.createdAt)}</td>
									<td>{formatMoney(o.total)}</td>
									<td>{mapStatusTag(o.status)}</td>
									<td>
										<select
											className="admin-select"
											value={o.status || "pendiente"}
											onChange={(e) => handleChangeOrderStatus(o.id, e.target.value)}
											disabled={savingOrder}
										>
											<option value="pendiente">Pendiente</option>
											<option value="proceso">En proceso</option>
											<option value="entregado">Entregado</option>
											<option value="cancelado">Cancelado</option>
										</select>
									</td>
									<td>
										<button className="btn-table" onClick={() => openOrderInfo(o)}>
											Ver info
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{selectedOrderInfo && (
						<div
							className="admin-modal-backdrop"
							style={{
								position: "fixed",
								inset: 0,
								background: "rgba(0,0,0,0.45)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								zIndex: 1000,
							}}
							onClick={closeOrderInfo}
						>
							<div
								className="admin-modal-content"
								style={{
									background: "#fff",
									padding: 24,
									borderRadius: 12,
									maxWidth: 520,
									width: "90%",
									boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
								}}
								onClick={(e) => e.stopPropagation()}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: 12,
									}}
								>
									<h3 style={{ margin: 0 }}>Detalle de la solicitud</h3>
									<button className="btn-secondary" onClick={closeOrderInfo}>
										Cerrar
									</button>
								</div>
								<p>
									<b>Cliente:</b>{" "}
									{selectedOrderInfo.clientName ||
										selectedOrderInfo.userEmail ||
										"-"}
								</p>
								<p>
									<b>Fecha:</b> {formatDateTime(selectedOrderInfo.createdAt)}
								</p>
								<p>
									<b>Total:</b> {formatMoney(selectedOrderInfo.total)}
								</p>
								<p>
									<b>Estado:</b>{" "}
									{mapStatusTag(selectedOrderInfo.status)}
								</p>
								<hr style={{ margin: "16px 0" }} />
								<h4>Productos solicitados</h4>
								{selectedOrderInfo.items?.length ? (
									<ul style={{ paddingLeft: 20 }}>
										{selectedOrderInfo.items.map((item, idx) => (
											<li key={`${selectedOrderInfo.id}-${idx}`}>
												{item.name} · {item.quantity} un. ·{" "}
												{formatMoney((item.price || 0) * (item.quantity || 0))}
											</li>
										))}
									</ul>
								) : (
									<p>No hay productos registrados en esta solicitud.</p>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</>
	);

	// --- NUEVO: catálogo ordenado y filtrado por categoría ---
	const renderCatalog = () => {
		if (products.length === 0) {
			return (
				<>
					<h1>Catálogo (productos activos)</h1>
					<p>No hay productos registrados.</p>
				</>
			);
		}

		// Obtener lista única de categorías
		const categorias = Array.from(
			new Map(
				products.map((p) => [
					p.categoriaId || "SIN_CAT",
					{
						id: p.categoriaId || "SIN_CAT",
						name: p.categoriaNombre || "Sin categoría",
					},
				])
			).values()
		).sort((a, b) => a.name.localeCompare(b.name, "es"));

		// Filtrar por categoría seleccionada
		const filtered = products.filter((p) =>
			selectedCatalogCategory === "TODAS"
				? true
				: (p.categoriaId || "SIN_CAT") === selectedCatalogCategory
		);

		// Ordenar productos por categoría y nombre
		const sorted = [...filtered].sort((a, b) => {
			const catA = a.categoriaNombre || "";
			const catB = b.categoriaNombre || "";
			if (catA.localeCompare(catB, "es") !== 0) {
				return catA.localeCompare(catB, "es");
			}
			return (a.name || "").localeCompare(b.name || "", "es");
		});

		return (
			<>
				<h1>Catálogo (productos activos)</h1>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						marginBottom: 12,
						flexWrap: "wrap",
					}}
				>
					<label style={{ fontSize: "0.9rem", color: "#666" }}>
						Filtrar por categoría:
					</label>
					<select
						className="admin-select"
						value={selectedCatalogCategory}
						onChange={(e) => setSelectedCatalogCategory(e.target.value)}
					>
						<option value="TODAS">Todas las categorías</option>
						{categorias.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
					<span style={{ fontSize: "0.8rem", color: "#888" }}>
						{sorted.length} producto(s) mostrado(s)
					</span>
				</div>

				<table className="admin-table admin-table-wide">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Categoría</th>
							<th>Tipo</th>
							<th>Precio</th>
							<th>Activo</th>
						</tr>
					</thead>
					<tbody>
						{sorted.map((p) => (
							<tr key={p.id}>
								<td>{p.name}</td>
								<td>{p.categoriaNombre || "-"}</td>
								<td>{p.type || "-"}</td>
								<td>{formatMoney(p.price)}</td>
								<td>{p.active !== false ? "Sí" : "No"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		);
	};

	// --- NUEVO: helpers de reportes ---
	const toDateOnly = (ts) => {
		if (!ts || !ts.toDate) return null;
		const d = ts.toDate();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	};

	const formatDateOnly = (d) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
			d.getDate()
		).padStart(2, "0")}`;

	const getUserById = (uid) => usersList.find((u) => u.id === uid);

	const applyReportFilters = () => {
		let filtered = orders.filter((o) => o.status === "entregado"); // ventas efectivas

		// rango de fechas
		if (reportFrom) {
			const from = new Date(reportFrom + "T00:00:00");
			filtered = filtered.filter((o) => {
				const d = toDateOnly(o.createdAt);
				return d && d >= from;
			});
		}
		if (reportTo) {
			const to = new Date(reportTo + "T23:59:59");
			filtered = filtered.filter((o) => {
				const d = toDateOnly(o.createdAt);
				return d && d <= to;
			});
		}

		// canal (según tipoUsuario en usuarios)
		if (reportChannel !== "TODOS") {
			filtered = filtered.filter((o) => {
				const u = getUserById(o.userId);
				if (!u) return false;
				if (reportChannel === "CLIENTE") return u.tipoUsuario === "Cliente";
				if (reportChannel === "EMPRESA") return u.tipoUsuario === "Empresa";
				return true;
			});
		}

		// categoría: alguna línea de la orden con categoriaId/categoriaNombre
		if (reportCategory !== "TODAS") {
			filtered = filtered.filter((o) =>
				(o.items || []).some((it) => it.categoriaId === reportCategory)
			);
		}

		return filtered;
	};

	const buildDailySummary = (ordersFiltered) => {
		const map = new Map();
		for (const o of ordersFiltered) {
			const d = toDateOnly(o.createdAt);
			if (!d) continue;
			const key = formatDateOnly(d);
			const prev = map.get(key) || { date: key, total: 0, count: 0 };
			prev.total += o.total || 0;
			prev.count += 1;
			map.set(key, prev);
		}
		return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
	};

	const buildTopProducts = (ordersFiltered) => {
		const map = new Map();
		for (const o of ordersFiltered) {
			for (const it of o.items || []) {
				const key = it.productId || it.name;
				const prev = map.get(key) || {
					productId: it.productId || null,
					name: it.name || "Sin nombre",
					quantity: 0,
					revenue: 0,
				};
				prev.quantity += it.quantity || 0;
				prev.revenue += (it.price || 0) * (it.quantity || 0);
				map.set(key, prev);
			}
		}
		return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
	};

	// NUEVO: export Excel “profesional” con 2 tablas en un .xls
	const exportReportExcel = (opts) => {
		const { daily, topProducts, totalVentas, meta } = opts;
		if (!daily.length && !topProducts.length) return;

		// Encabezado descriptivo
		const infoRows = [
			["GM Express - Reporte de ventas"],
			[
				"Período",
				`${meta.desde || "Sin límite"} al ${meta.hasta || "Sin límite"}`,
			],
			["Canal", meta.canal],
			["Categoría", meta.categoria],
			["Total ventas (CLP)", totalVentas],
			[], // línea en blanco
		];

		const tableInfo = (rows) =>
			rows.map(
				(r) =>
					`<tr>${r
						.map((cell) => `<td style="border:1px solid #ccc;padding:4px;">${cell}</td>`)
						.join("")}</tr>`
			);

		// Hoja 1: resumen por día
		const dailyHeader = ["Fecha", "Cantidad de pedidos", "Total vendido (CLP)"];
		const dailyRows = daily.map((d) => [
			d.date,
			d.count,
			d.total.toLocaleString("es-CL"),
		]);

		// Hoja 2: top productos
		const topHeader = ["Producto", "Cantidad vendida", "Ingresos (CLP)"];
		const topRows = topProducts.map((p) => [
			p.name,
			p.quantity,
			p.revenue.toLocaleString("es-CL"),
		]);

		const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <!-- Indicamos a Excel que hay varias "hojas" mediante secciones -->
        </head>
        <body>
          <table>
            ${tableInfo(infoRows).join("")}
          </table>
          <br/>
          <table border="1">
            <tr>
              ${dailyHeader
								.map(
									(h) =>
										`<th style="background:#0b6b43;color:#fff;padding:4px;">${h}</th>`
								)
								.join("")}
            </tr>
            ${tableInfo(dailyRows).join("")}
          </table>
          <br/>
          <table border="1">
            <tr>
              ${topHeader
								.map(
									(h) =>
										`<th style="background:#0b6b43;color:#fff;padding:4px;">${h}</th>`
								)
								.join("")}
            </tr>
            ${tableInfo(topRows).join("")}
          </table>
        </body>
      </html>
    `.trim();

		const blob = new Blob([html], {
			type: "application/vnd.ms-excel;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `reporte_ventas_${meta.fileSuffix || "gmexpress"}.xls`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const renderReports = () => {
		const categorias = Array.from(
			new Map(
				products.map((p) => [
					p.categoriaId || "SIN_CAT",
					{
						id: p.categoriaId || "SIN_CAT",
						name: p.categoriaNombre || "Sin categoría",
					},
				])
			).values()
		).sort((a, b) => a.name.localeCompare(b.name, "es"));

		const filtered = applyReportFilters();
		const daily = buildDailySummary(filtered);
		const topProducts = buildTopProducts(filtered);
		const totalVentas = filtered.reduce(
			(sum, o) => sum + (o.total || 0),
			0
		);

		const meta = {
			desde: reportFrom || "",
			hasta: reportTo || "",
			canal:
				reportChannel === "TODOS"
					? "Todos"
					: reportChannel === "CLIENTE"
					? "Clientes finales"
					: "Empresas",
			categoria:
				reportCategory === "TODAS"
					? "Todas"
					: categorias.find((c) => c.id === reportCategory)?.name || reportCategory,
			fileSuffix: `${reportFrom || "inicio"}_${reportTo || "hoy"}`.replace(
				/[^\d_]/g,
				""
			),
		};

		return (
			<>
				<h1>Reportes de ventas</h1>
				<p>
					Filtra por rango de fechas, canal y categoría para analizar el rendimiento
					de las ventas (solo pedidos con estado <b>entregado</b>).
				</p>

				{/* Filtros ordenados */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
						marginBottom: 16,
					}}
				>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
							gap: 10,
						}}
					>
						<div>
							<label style={{ fontSize: "0.8rem", color: "#555" }}>
								Desde (fecha)
							</label>
							<input
								type="date"
								value={reportFrom}
								onChange={(e) => setReportFrom(e.target.value)}
								style={{
									width: "100%",
									borderRadius: 8,
									border: "1px solid #ddd",
									padding: "6px 8px",
									fontSize: "0.85rem",
								}}
							/>
						</div>
						<div>
							<label style={{ fontSize: "0.8rem", color: "#555" }}>
								Hasta (fecha)
							</label>
							<input
								type="date"
								value={reportTo}
								onChange={(e) => setReportTo(e.target.value)}
								style={{
									width: "100%",
									borderRadius: 8,
									border: "1px solid #ddd",
									padding: "6px 8px",
									fontSize: "0.85rem",
								}}
							/>
						</div>
					</div>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
							gap: 10,
						}}
					>
						<div>
							<label style={{ fontSize: "0.8rem", color: "#555" }}>
								Canal
							</label>
							<select
								className="admin-select"
								value={reportChannel}
								onChange={(e) => setReportChannel(e.target.value)}
								style={{ width: "100%" }}
							>
								<option value="TODOS">Todos</option>
								<option value="CLIENTE">Cliente</option>
								<option value="EMPRESA">Empresa</option>
							</select>
						</div>
						<div>
							<label style={{ fontSize: "0.8rem", color: "#555" }}>
								Categoría
							</label>
							<select
								className="admin-select"
								value={reportCategory}
								onChange={(e) => setReportCategory(e.target.value)}
								style={{ width: "100%" }}
							>
								<option value="TODAS">Todas</option>
								{categorias.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
					<button
						className="btn-primary"
						type="button"
						onClick={() => setReportRequested(true)}
					>
						Generar reporte
					</button>
					{filtered.length > 0 && (
						<button
							className="btn-secondary"
							type="button"
							onClick={() =>
								exportReportExcel({
									daily,
									topProducts,
									totalVentas,
									meta,
								})
							}
						>
							Exportar reporte (Excel)
						</button>
					)}
				</div>

				{reportRequested && filtered.length === 0 && (
					<p>
						<b>Sin ventas en este periodo</b>.
					</p>
				)}

				{reportRequested && filtered.length > 0 && (
					<>
						<p style={{ fontSize: "0.9rem" }}>
							<b>Ventas entregadas en el período:</b>{" "}
							{filtered.length} pedidos · Total: {formatMoney(totalVentas)}
						</p>

						<h3>Totales por día</h3>
						<table className="admin-table admin-table-wide">
							<thead>
								<tr>
									<th>Fecha</th>
									<th>Cantidad de pedidos</th>
									<th>Total vendido</th>
								</tr>
							</thead>
							<tbody>
								{daily.map((d) => (
									<tr key={d.date}>
										<td>{d.date}</td>
										<td>{d.count}</td>
										<td>{formatMoney(d.total)}</td>
									</tr>
								))}
							</tbody>
						</table>

						<h3 style={{ marginTop: 18 }}>Productos más vendidos</h3>
						<table className="admin-table admin-table-wide">
							<thead>
								<tr>
									<th>Producto</th>
									<th>Cantidad vendida</th>
									<th>Ingresos</th>
								</tr>
							</thead>
							<tbody>
								{topProducts.map((p) => (
									<tr key={p.productId || p.name}>
										<td>{p.name}</td>
										<td>{p.quantity}</td>
										<td>{formatMoney(p.revenue)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</>
				)}
			</>
		);
	};

	// ---- MANTENEDOR DE USUARIOS ----

	const startEditUser = (u) => {
		setEditingUserId(u.id);
		setEditUserForm({
			nombre: u.nombre || "",
			apellidoPaterno: u.apellidoPaterno || "",
			apellidoMaterno: u.apellidoMaterno || "",
			tipoUsuario: u.tipoUsuario || "Cliente",
			role: u.role || "cliente",
			email: u.email || "",
		});
	};

	const cancelEditUser = () => {
		setEditingUserId(null);
	};

	const handleEditUserChange = (e) => {
		const { name, value } = e.target;
		setEditUserForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const saveUser = async (userId) => {
		try {
			// REGLA: no permitir asignar superadmin a otro usuario distinto a mí
			if (editUserForm.role === "superadmin" && userId !== user.uid) {
				await Swal.fire(
					"Restricción de rol",
					"Solo puede existir un superadmin y corresponde a tu cuenta actual.",
					"info"
				);
				return;
			}

			setSavingUser(true);
			const docRef = doc(db, "usuarios", userId);
			await updateDoc(docRef, {
				nombre: editUserForm.nombre.trim(),
				apellidoPaterno: editUserForm.apellidoPaterno.trim(),
				apellidoMaterno: editUserForm.apellidoMaterno.trim(),
				tipoUsuario: editUserForm.tipoUsuario,
				role: editUserForm.role,
				email: editUserForm.email.trim(),
			});
			setUsersList((prev) =>
				prev.map((u) =>
					u.id === userId
						? {
								...u,
								...editUserForm,
								email: editUserForm.email.trim(),
						  }
						: u
				)
			);
			setEditingUserId(null);
			Swal.fire("Guardado", "Usuario actualizado correctamente.", "success");
		} catch (err) {
			console.error("Error actualizando usuario:", err);
			Swal.fire(
				"Error",
				err.message || "No se pudo actualizar el usuario.",
				"error"
			);
		} finally {
			setSavingUser(false);
		}
	};

	const deleteUser = async (userId, email) => {
		// REGLA: no permitir que el superadmin se elimine a sí mismo
		if (userId === user.uid) {
			await Swal.fire(
				"Operación no permitida",
				"No puedes eliminar tu propio usuario superadmin.",
				"info"
			);
			return;
		}

		const confirm = await Swal.fire({
			title: "Eliminar usuario",
			text: `¿Eliminar el usuario ${email || userId}? Esta acción no se puede deshacer.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		});
		if (!confirm.isConfirmed) return;
		try {
			await deleteDoc(doc(db, "usuarios", userId));
			setUsersList((prev) => prev.filter((u) => u.id !== userId));
			Swal.fire("Eliminado", "El usuario fue eliminado de la base de datos.", "success");
		} catch (err) {
			console.error("Error eliminando usuario:", err);
			Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
		}
	};

	const renderUsers = () => (
		<>
			<h1>Mantenedor de usuarios</h1>
			<p>
				Listado de usuarios registrados en <b>usuarios</b>. Puedes editar sus datos
				básicos como nombres, apellidos, correo, tipo de usuario.
			</p>
			{usersList.length === 0 ? (
				<p>No hay usuarios registrados.</p>
			) : (
				<table className="admin-table admin-table-wide">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Correo</th>
							<th>Tipo usuario</th>
							<th>Rol</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{usersList.map((u) => (
							<tr key={u.id}>
								<td>
									{editingUserId === u.id ? (
										<div className="admin-user-name-cell">
											<input
												type="text"
												className="admin-inline-input"
												value={editUserForm.nombre}
												name="nombre"
												onChange={handleEditUserChange}
												placeholder="Nombre"
											/>
											<input
												type="text"
												className="admin-inline-input"
												value={editUserForm.apellidoPaterno}
												name="apellidoPaterno"
												onChange={handleEditUserChange}
												placeholder="Apellido paterno"
											/>
											<input
												type="text"
												className="admin-inline-input"
												value={editUserForm.apellidoMaterno}
												name="apellidoMaterno"
												onChange={handleEditUserChange}
												placeholder="Apellido materno"
											/>
										</div>
									) : (
										<div className="admin-user-name-cell">
											<span className="admin-user-name-main">
												{u.nombre} {u.apellidoPaterno} {u.apellidoMaterno}
											</span>
											<span className="admin-user-name-sub">
												ID: {u.id}
											</span>
										</div>
									)}
								</td>
								<td>
									{editingUserId === u.id ? (
										<input
											type="email"
											className="admin-inline-input"
											value={editUserForm.email}
											name="email"
											onChange={handleEditUserChange}
											placeholder="Correo"
										/>
									) : (
										u.email
									)}
								</td>
								<td>
									{editingUserId === u.id ? (
										<select
											name="tipoUsuario"
											value={editUserForm.tipoUsuario}
											onChange={handleEditUserChange}
											className="admin-select"
										>
											<option value="Cliente">Cliente</option>
											<option value="Empresa">Empresa</option>
										</select>
									) : (
										u.tipoUsuario || "-"
									)}
								</td>
								<td>
									{editingUserId === u.id ? (
										<select
											name="role"
											value={editUserForm.role}
											onChange={handleEditUserChange}
											className="admin-select"
										>
											<option value="cliente">cliente</option>
											<option value="empresa">empresa</option>
											<option value="admin">admin</option>
											<option value="superadmin">superadmin</option>
										</select>
									) : (
										u.role || "cliente"
									)}
								</td>
								<td>
									{editingUserId === u.id ? (
										<>
											<button
												className="btn-table"
												onClick={() => saveUser(u.id)}
												disabled={savingUser}
											>
												Guardar
											</button>
											<button
												className="btn-table-danger"
												onClick={cancelEditUser}
												disabled={savingUser}
												style={{ marginLeft: 4 }}
											>
												Cancelar
											</button>
										</>
									) : (
										<>
											<button
												className="btn-table"
												onClick={() => startEditUser(u)}
											>
												Editar
											</button>
											<button
												className="btn-table-danger"
												onClick={() => deleteUser(u.id, u.email)}
												style={{ marginLeft: 4 }}
											>
												Eliminar
											</button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);

	return (
		<div className="admin-layout">
			<aside className="admin-sidebar">
				<h4>Panel GM Express</h4>
				<nav>
					<a
						className={activeSection === "dashboard" ? "active" : ""}
						onClick={() => setActiveSection("dashboard")}
					>
						🏠 Dashboard
					</a>
					<a
						className={activeSection === "orders" ? "active" : ""}
						onClick={() => setActiveSection("orders")}
					>
						📦 Gestión de pedidos
					</a>
					<a
						className={activeSection === "catalog" ? "active" : ""}
						onClick={() => setActiveSection("catalog")}
					>
						🛒 Catálogo
					</a>
					<a
						className={activeSection === "reports" ? "active" : ""}
						onClick={() => setActiveSection("reports")}
					>
						📈 Reportes de ventas
					</a>
					<a
						className={activeSection === "users" ? "active" : ""}
						onClick={() => setActiveSection("users")}
					>
						👤 Mantenedor de usuarios
					</a>
				</nav>
			</aside>

			<main className="admin-main-content">
				{loading ? (
					<p>Cargando datos...</p>
				) : activeSection === "dashboard" ? (
					renderDashboard()
				) : activeSection === "orders" ? (
					renderOrders()
				) : activeSection === "catalog" ? (
					renderCatalog()
				) : activeSection === "reports" ? (
					renderReports()
				) : (
					renderUsers()
				)}
			</main>
		</div>
	);
};

export default AdminPanel;
