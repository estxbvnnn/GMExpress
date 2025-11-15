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
	const [editingUserId, setEditingUserId] = useState(null);
	const [editUserForm, setEditUserForm] = useState({
		nombre: "",
		apellidoPaterno: "",
		apellidoMaterno: "",
		tipoUsuario: "Cliente",
		role: "cliente",
		email: "",
	});

	// NUEVO: categoría seleccionada en la sección Catálogo
	const [selectedCatalogCategory, setSelectedCatalogCategory] = useState("TODAS");

	const loadData = async () => {
		setLoading(true);
		try {
			console.log("AdminPanel: cargando datos para usuario:", user?.uid, user?.role);

			// pedidos
			const ordersSnap = await getDocs(
				query(collection(db, "orders"), orderBy("createdAt", "desc"))
			);
			const ordersData = ordersSnap.docs.map((d) => ({
				id: d.id,
				...d.data(),
			}));

			// productos
			const prodSnap = await getDocs(collection(db, "productos"));
			const prodData = prodSnap.docs.map((d) => ({
				id: d.id,
				...d.data(),
			}));

			// usuarios
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
		return (
			d.getMonth() === now.getMonth() &&
			d.getFullYear() === now.getFullYear()
		);
	};

	// KPIs
	const nuevasSolicitudes = orders.filter(
		(o) => o.status === "pendiente"
	).length;

	const ventasMes = orders
		.filter((o) => o.status === "entregado" && isSameMonth(o.createdAt))
		.reduce((sum, o) => sum + (o.total || 0), 0);

	const productosActivos = products.filter((p) => p.active !== false).length;

	const formatMoney = (n) =>
		`$${(n || 0).toLocaleString("es-CL")}`;

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
				<table className="admin-table admin-table-wide">
					<thead>
						<tr>
							<th>ID</th>
							<th>Cliente</th>
							<th>Fecha</th>
							<th>Total</th>
							<th>Estado</th>
							<th>Cambiar estado</th>
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
										onChange={(e) =>
											handleChangeOrderStatus(o.id, e.target.value)
										}
										disabled={savingOrder}
									>
										<option value="pendiente">Pendiente</option>
										<option value="proceso">En proceso</option>
										<option value="entregado">Entregado</option>
										<option value="cancelado">Cancelado</option>
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
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

	const renderReports = () => {
		const delivered = orders.filter((o) => o.status === "entregado");
		const totalVentas = delivered.reduce(
			(sum, o) => sum + (o.total || 0),
			0
		);

		return (
			<>
				<h1>Reportes de ventas</h1>
				<p>
					<b>Total ventas entregadas:</b> {formatMoney(totalVentas)}
				</p>
				{delivered.length === 0 ? (
					<p>No hay ventas entregadas registradas.</p>
				) : (
					<table className="admin-table admin-table-wide">
						<thead>
							<tr>
								<th>ID</th>
								<th>Cliente</th>
								<th>Fecha</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							{delivered.map((o) => (
								<tr key={o.id}>
									<td>{o.id}</td>
									<td>{o.clientName || o.userEmail || "-"}</td>
									<td>{formatDateTime(o.createdAt)}</td>
									<td>{formatMoney(o.total)}</td>
								</tr>
							))}
						</tbody>
					</table>
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
				básicos y rol (cliente, empresa, admin). Solo tu cuenta conserva el rol{" "}
				<b>superadmin</b>.
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
