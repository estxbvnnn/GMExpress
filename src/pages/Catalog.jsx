import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Catálogo estático tipo ejemplo, organizado por niveles
export const CATALOG = [
	{
		id: "alimentacion-transportada",
		name: "Alimentación transportada",
		description:
			"Menús diarios preparados en cocina central y transportados a tu empresa con control de temperatura.",
		items: [
			{
				id: "almuerzo-tradicional",
				name: "Almuerzo tradicional",
				short: "Plato principal, acompañamiento, postre y pan.",
				ingredients: "Carne o pollo, arroz o papas, ensalada estacional.",
				conditions: "Entrega antes de las 13:00 hrs. Consumo inmediato.",
				price: 5500,
			},
			{
				id: "almuerzo-vegetariano",
				name: "Almuerzo vegetariano",
				short: "Opción equilibrada sin carnes.",
				ingredients:
					"Proteína vegetal (legumbres, tofu), cereales, verduras frescas.",
				conditions: "Entrega antes de las 13:00 hrs. Ideal para dietas sin carne.",
				price: 5600,
			},
			{
				id: "almuerzo-vegano",
				name: "Almuerzo vegano",
				short: "Preparación 100% libre de insumos de origen animal.",
				ingredients:
					"Legumbres, granos, verduras, aceites vegetales, frutos secos.",
				conditions: "Entrega antes de las 13:00 hrs. Consumir en 2 horas.",
				price: 5800,
			},
			{
				id: "almuerzo-hipocalorico",
				name: "Almuerzo hipocalórico",
				short: "Menú bajo en calorías, con enfoque saludable.",
				ingredients:
					"Proteína magra, verduras al vapor, porciones controladas de carbohidratos.",
				conditions:
					"Entrega antes de las 13:00 hrs. Para planes de control de peso.",
				price: 5900,
			},
			{
				id: "menu-especial-dia",
				name: "Menú especial del día",
				short: "Preparación destacada según temporada o temática.",
				ingredients:
					"Inspiración del chef: puede incluir carnes, pastas o preparaciones típicas.",
				conditions:
					"Se debe solicitar con 24 horas de anticipación para grupos.",
				price: 6200,
			},
		],
	},
	{
		id: "servicio-presencial",
		name: "Servicio presencial en sucursales",
		description:
			"Operación de casino en sitio con personal, montaje de línea y atención continua.",
		items: [
			{
				id: "linea-completa",
				name: "Línea de servicio completa",
				short: "Autoservicio con platos calientes, ensaladas y postres.",
				ingredients:
					"Variedad diaria de preparaciones calientes, frías y dulces.",
				conditions:
					"Servicio continuo en horario acordado. Incluye equipo de atención.",
				price: 0,
			},
			{
				id: "desayuno-corporativo",
				name: "Desayuno corporativo",
				short: "Servicio presencial de desayunos para colaboradores.",
				ingredients:
					"Café, té, lácteos, panes, frutas, repostería simple, jugos.",
				conditions: "Horario entre 7:30 y 10:00. Mínimo de personas a convenir.",
				price: 0,
			},
			{
				id: "colaciones-turnos",
				name: "Colaciones para turnos",
				short: "Opciones para turnos nocturnos o extendidos.",
				ingredients:
					"Preparaciones individuales empaquetadas y listas para consumir.",
				conditions:
					"Entrega según planificación de turnos, con reposición programada.",
				price: 0,
			},
			{
				id: "modulo-ensaladas",
				name: "Módulo de ensaladas",
				short: "Barra de ensaladas frescas y toppings.",
				ingredients: "Verduras frescas, legumbres, cereales, aderezos.",
				conditions:
					"Requiere punto de refrigeración y personal de reposición.",
				price: 0,
			},
			{
				id: "servicio-colacion-rapida",
				name: "Servicio de colación rápida",
				short: "Snack salado, dulce y bebidas para pausas breves.",
				ingredients: "Sándwiches fríos, barritas, frutas, bebidas.",
				conditions:
					"Disponible en horarios punta. Se adapta a volumen de personal.",
				price: 0,
			},
		],
	},
	{
		id: "concesion-casinos",
		name: "Concesión de casinos (colegios/universidades)",
		description:
			"Administración completa de casinos educacionales bajo normas vigentes.",
		items: [
			{
				id: "menu-escolar-basico",
				name: "Menú escolar básico",
				short: "Almuerzo completo según lineamientos nutricionales.",
				ingredients: "Preparación principal, acompañamiento, postre y jugo.",
				conditions:
					"Cumple con normativas de alimentación escolar. Entrega en comedor.",
				price: 0,
			},
			{
				id: "menu-escolar-especial",
				name: "Menú escolar especial",
				short: "Opciones adaptadas para alergias o restricciones.",
				ingredients: "Preparaciones sin gluten, sin lactosa u otras restricciones.",
				conditions:
					"Requiere registro médico y coordinación con la institución.",
				price: 0,
			},
			{
				id: "menu-universitario",
				name: "Menú universitario",
				short: "Platos rápidos, contundentes y a precio accesible.",
				ingredients: "Pastas, bowls, menús del día, opciones vegetarianas.",
				conditions: "Servicio en línea de casino y puntos de venta anexos.",
				price: 0,
			},
			{
				id: "colacion-manana",
				name: "Colación de mañana",
				short: "Snack energético para recreos y pausas.",
				ingredients: "Fruta, snack saludable y bebida ligera.",
				conditions:
					"Distribución en recreos definidos por el establecimiento.",
				price: 0,
			},
			{
				id: "colacion-tarde",
				name: "Colación de tarde",
				short: "Alternativa ligera para la jornada vespertina.",
				ingredients: "Sándwich, fruta y bebida.",
				conditions: "Disponible en jornada completa o vespertina.",
				price: 0,
			},
		],
	},
	{
		id: "coffee-break-eventos",
		name: "Coffee break y eventos",
		description:
			"Servicios para reuniones, capacitaciones, seminarios y celebraciones empresariales.",
		items: [
			{
				id: "sandwiches",
				name: "Selección de sándwiches",
				short: "Mini sándwiches fríos y calientes.",
				ingredients: "Jamón, queso, vegetales, salsas suaves, panes variados.",
				conditions:
					"Entrega y montaje 30–45 min antes del inicio del evento.",
				price: 4500,
			},
			{
				id: "jugos-naturales",
				name: "Jugos naturales",
				short: "Jugos de fruta natural en dispenser o botellas individuales.",
				ingredients: "Naranja, piña, frutos rojos, agua purificada.",
				conditions:
					"Refrigeración durante el evento. Incluye vasos y hielo si se requiere.",
				price: 3000,
			},
			{
				id: "reposteria-mixta",
				name: "Repostería mixta",
				short: "Variedad de dulces de tamaño petit.",
				ingredients: "Queques, brownies, tartaletas, galletas.",
				conditions: "Presentación en bandejas o mesas de servicio.",
				price: 4200,
			},
			{
				id: "colaciones-dulces",
				name: "Colaciones dulces",
				short: "Snacks dulces individuales.",
				ingredients: "Barritas, galletas, chocolates, frutos secos.",
				conditions: "Ideal para media mañana y media tarde.",
				price: 3800,
			},
			{
				id: "colaciones-saladas",
				name: "Colaciones saladas",
				short: "Snacks salados para pausas o reuniones largas.",
				ingredients: "Mix de frutos secos, chips, mini empanadas.",
				conditions:
					"Se entrega en envases individuales o bandejas compartidas.",
				price: 3800,
			},
		],
	},
	{
		id: "reposteria-snack",
		name: "Repostería y snack con tickets",
		description:
			"Productos individuales para consumo con tickets o vales de alimentación.",
		items: [
			{
				id: "queques",
				name: "Queques individuales",
				short: "Queques de vainilla, naranja y zanahoria.",
				ingredients: "Harina, huevos, azúcar, saborizantes naturales.",
				conditions: "Vida útil de 2–3 días. Mantener en lugar fresco.",
				price: 1500,
			},
			{
				id: "tortas-porcion",
				name: "Tortas por porción",
				short: "Porciones individuales de torta del día.",
				ingredients: "Bizcocho, crema, rellenos variados.",
				conditions: "Refrigerar hasta su consumo. Ideal para celebraciones.",
				price: 2200,
			},
			{
				id: "galletas",
				name: "Galletas artesanales",
				short: "Galletas dulces variadas.",
				ingredients: "Harina, mantequilla, azúcar, chips de chocolate, avena.",
				conditions: "En envase individual sellado, vida útil hasta 7 días.",
				price: 1200,
			},
			{
				id: "brownies",
				name: "Brownies",
				short: "Brownies de chocolate en formato snack.",
				ingredients: "Cacao, mantequilla, azúcar, harina, nueces (opcional).",
				conditions:
					"Presentación individual, ideal para coffee break o colación.",
				price: 1600,
			},
			{
				id: "muffins",
				name: "Muffins surtidos",
				short: "Muffins de arándano, chocolate y vainilla.",
				ingredients: "Harina, huevos, azúcar, frutas y saborizantes.",
				conditions: "Consumo ideal dentro de 48 horas desde la entrega.",
				price: 1600,
			},
		],
	},
];

const CATEGORY_ART = {
	"alimentacion-transportada":
		"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=60",
	"servicio-presencial":
		"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=60",
	"concesion-casinos":
		"https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=60",
	"coffee-break-eventos":
		"https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=60",
	"reposteria-snack":
		"https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=60",
};

const Catalog = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [selectedCategoryId, setSelectedCategoryId] = useState(null);
	const [selectedItemId, setSelectedItemId] = useState(null);

	const [companyProducts, setCompanyProducts] = useState([]);
	const [loadingProducts, setLoadingProducts] = useState(true);

	// NUEVO: cantidad seleccionada por producto (id -> cantidad)
	const [quantities, setQuantities] = useState({});

	useEffect(() => {
		const load = async () => {
			try {
				setLoadingProducts(true);
				const snap = await getDocs(collection(db, "productos"));
				const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				setCompanyProducts(data);
			} catch (err) {
				console.error("Error al cargar productos de empresas:", err);
				Swal.fire(
					"Error",
					"No se pudieron cargar los productos adicionales.",
					"error"
				);
			} finally {
				setLoadingProducts(false);
			}
		};
		load();
	}, []);

	const selectedCategory =
		CATALOG.find((c) => c.id === selectedCategoryId) || null;
	// selectedItem ya no se usa para productos estáticos de catálogo
	const selectedItem =
		selectedCategory?.items.find((i) => i.id === selectedItemId) || null;

	const companyItemsForCategory = selectedCategory
		? companyProducts.filter(
				(p) =>
					p.categoriaId === selectedCategory.id &&
					p.active !== false // por si manejas inactivos
		  )
		: [];

	const handleQuantityChange = (productId, value) => {
		const n = Number(value);
		if (isNaN(n) || n <= 0) {
			setQuantities((prev) => ({ ...prev, [productId]: 1 }));
		} else {
			setQuantities((prev) => ({ ...prev, [productId]: n }));
		}
	};

	const getCartKey = (uid) => `cart_${uid}`;

	const readCartFromStorage = (uid) => {
		try {
			return JSON.parse(localStorage.getItem(getCartKey(uid)) || "[]");
		} catch {
			return [];
		}
	};

	const writeCartToStorage = (uid, data) => {
		localStorage.setItem(getCartKey(uid), JSON.stringify(data));
		localStorage.removeItem("cart");
	};

	const handleAddToCart = async (product, quantity = 1) => {
		const qty = Number(quantity) || 1;

		if (!user) {
			await Swal.fire(
				"Sesión requerida",
				"Debes iniciar sesión para agregar productos.",
				"info"
			);
			navigate("/login");
			return;
		}

		const enrichedProduct = {
			...product,
			ownerId: product.ownerId || product.owner?.id || null,
			ownerEmail: product.ownerEmail || product.owner?.email || null,
			categoriaId: product.categoriaId || selectedCategory?.id || null,
			categoriaNombre: product.categoriaNombre || selectedCategory?.name || null,
		};

		const stored = readCartFromStorage(user.uid);
		const existing = stored.find((p) => p.id === enrichedProduct.id);
		let updated;
		if (existing) {
			updated = stored.map((p) =>
				p.id === enrichedProduct.id
					? { ...p, quantity: (p.quantity || 0) + qty }
					: p
			);
		} else {
			updated = [
				...stored,
				{
					...enrichedProduct,
					type: selectedCategory?.name || enrichedProduct.categoriaNombre,
					quantity: qty,
				},
			];
		}
		writeCartToStorage(user.uid, updated);
		Swal.fire(
			"Agregado",
			`Se agregaron ${qty} unidad(es) al carrito.`,
			"success"
		);
	};

	const handleBackToCategories = () => {
		setSelectedCategoryId(null);
		setSelectedItemId(null);
	};

	const handleBackToItems = () => {
		setSelectedItemId(null);
	};

	const catalogStyles = {
		page: { display: "flex", flexDirection: "column", gap: 32 },
		hero: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
			gap: 24,
			background: "linear-gradient(135deg,#052b1b,#0c5d3b)",
			color: "#e4fff2",
			padding: "40px 32px",
			borderRadius: 32,
			boxShadow: "0 30px 60px rgba(5,45,30,0.35)",
			overflow: "hidden",
		},
		productTableWrap: {
			background: "#ffffff",
			borderRadius: 28,
			boxShadow: "0 25px 55px rgba(8,38,26,0.14)",
			padding: 12,
			overflowX: "auto",
			border: "1px solid rgba(8,60,38,0.08)",
		},
		productTable: {
			width: "100%",
			borderCollapse: "separate",
			borderSpacing: "0 10px",
		},
		productTableHeadCell: {
			textAlign: "left",
			fontSize: "0.85rem",
			textTransform: "uppercase",
			color: "#0f5134",
			padding: "12px 16px",
			borderBottom: "1px solid rgba(8,60,38,0.12)",
		},
		productTableRow: {
			background: "#f8fbf8",
			borderRadius: 18,
			boxShadow: "0 10px 25px rgba(5,35,23,0.08)",
		},
		productTableCell: {
			padding: "16px 18px",
			fontSize: "0.95rem",
			color: "#1d3429",
		},
		productActions: { display: "flex", alignItems: "center", gap: 10 },
		tableQtyInput: {
			width: 70,
			borderRadius: 999,
			border: "1px solid rgba(9,72,40,0.2)",
			padding: "6px 10px",
			textAlign: "center",
			fontWeight: 600,
		},
		tableBtn: {
			borderRadius: 999,
			border: "none",
			padding: "10px 18px",
			background: "linear-gradient(120deg,#34d593,#0ea164)",
			color: "#032015",
			fontWeight: 600,
			cursor: "pointer",
			boxShadow: "0 14px 24px rgba(4,32,20,0.2)",
		},
		sectionTitle: { margin: "24px 0 8px", color: "#0b3826" },
		categoryGrid: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
			gap: 20,
		},
		categoryCard: {
			position: "relative",
			borderRadius: 28,
			overflow: "hidden",
			minHeight: 220,
			color: "#fff",
			cursor: "pointer",
			boxShadow: "0 25px 55px rgba(7,35,25,0.25)",
		},
		categoryOverlay: {
			position: "absolute",
			inset: 0,
			background: "linear-gradient(120deg,rgba(3,20,13,0.85),rgba(7,66,40,0.55))",
		},
		categoryBody: { position: "relative", padding: 24, display: "flex", flexDirection: "column", gap: 10 },
		productGrid: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
			gap: 20,
		},
		detailHeader: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			gap: 16,
			flexWrap: "wrap",
			marginTop: 12,
		},
		backBtn: {
			borderRadius: 999,
			border: "1px solid rgba(8,50,30,0.3)",
			background: "transparent",
			padding: "8px 18px",
			fontWeight: 600,
			color: "#0c5d3b",
			cursor: "pointer",
		},
		productCard: {
			borderRadius: 28,
			background: "#fff",
			boxShadow: "0 25px 55px rgba(8,38,26,0.14)",
			display: "flex",
			flexDirection: "column",
			overflow: "hidden",
			border: "1px solid rgba(10,70,44,0.08)",
		},
		productBody: { padding: 20, display: "flex", flexDirection: "column", gap: 10 },
		tag: {
			alignSelf: "flex-start",
			padding: "4px 12px",
			borderRadius: 999,
			background: "rgba(4,89,58,0.12)",
			color: "#0c5d3b",
			fontSize: 12,
			fontWeight: 600,
		},
		cardFooter: {
			borderTop: "1px solid rgba(10,70,44,0.08)",
			padding: "16px 20px",
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			gap: 10,
		},
		qtyInput: {
			width: 80,
			borderRadius: 999,
			border: "1px solid #d7e7df",
			textAlign: "center",
			padding: "6px 10px",
			fontWeight: 600,
		},
		primaryBtn: {
			borderRadius: 999,
			border: "none",
			padding: "10px 18px",
			fontWeight: 600,
			color: "#032012",
			background: "linear-gradient(120deg,#3dd598,#0da064)",
			boxShadow: "0 18px 32px rgba(5,38,24,0.2)",
			cursor: "pointer",
		},
		emptyState: {
			background: "linear-gradient(120deg,#f2faf5,#e5f3ea)",
			borderRadius: 24,
			padding: 32,
			textAlign: "center",
			color: "#4b6b5a",
		},
	};

	const getCategoryImage = (catId) =>
		CATEGORY_ART[catId] ||
		"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=60";

	return (
		<div className="page-container" style={catalogStyles.page}>
			<section style={catalogStyles.hero}>
				<div>
					<h1 style={{ margin: "12px 0 8px" }}>Selecciona líneas, menús y proveedores certificados</h1>
					<p style={{ maxWidth: 520, lineHeight: 1.6 }}>
						Explora categorías curadas, revisa menús de referencia y añade productos de empresas socias
						a tu carrito para enviar solicitudes al equipo GM Express.
					</p>
					<div style={catalogStyles.heroStats}>
						<div style={catalogStyles.heroCard}>
							<p style={{ margin: 0, opacity: 0.7 }}>Menús disponibles</p>
							<h3 style={{ margin: "4px 0 0" }}>+250</h3>
						</div>
						<div style={catalogStyles.heroCard}>
							<p style={{ margin: 0, opacity: 0.7 }}>Productos Activos</p>
							<h3 style={{ margin: "4px 0 0" }}>{companyProducts.length}</h3>
						</div>
					</div>
				</div>
				<div
					style={{
						borderRadius: 28,
						background: "rgba(255,255,255,0.08)",
						padding: 24,
						display: "flex",
						flexDirection: "column",
						gap: 12,
					}}
				>
					<h3 style={{ margin: 0 }}>Tu panel digest</h3>
					<p style={{ margin: 0, opacity: 0.75 }}>
						Accede a “Mis pedidos” para monitorear solicitudes enviadas y estados de entrega.
					</p>
					{user ? (
						<button
							type="button"
							style={{ ...catalogStyles.primaryBtn, alignSelf: "flex-start" }}
							onClick={() => navigate("/mis-pedidos")}
						>
							Ver mis pedidos
						</button>
					) : (
						<button
							type="button"
							style={{ ...catalogStyles.primaryBtn, alignSelf: "flex-start" }}
							onClick={() => navigate("/login")}
						>
							Iniciar sesión
						</button>
					)}
				</div>
			</section>

			{!selectedCategory && (
				<header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<h2 style={catalogStyles.sectionTitle}>Catálogo GM Express</h2>
					<p style={{ color: "#5a6b63", margin: 0 }}>
						Selecciona una categoría para revisar los productos disponibles y armar tus solicitudes.
					</p>
				</header>
			)}

			{!selectedCategory ? (
				<>
					<h2 style={catalogStyles.sectionTitle}>Categorías principales</h2>
					<div style={catalogStyles.categoryGrid}>
						{CATALOG.map((cat) => (
							<div
								key={cat.id}
								style={{ ...catalogStyles.categoryCard, backgroundImage: `url(${getCategoryImage(cat.id)})` }}
								onClick={() => {
									setSelectedCategoryId(cat.id);
									setSelectedItemId(null);
								}}
							>
								<div style={catalogStyles.categoryOverlay} />
								<div style={catalogStyles.categoryBody}>
									<h3 style={{ margin: 0 }}>{cat.name}</h3>
									<p style={{ margin: 0, opacity: 0.8 }}>{cat.description}</p>
									<span style={{ fontSize: 13, opacity: 0.7 }}>
										{cat.items.length} menús de referencia
									</span>
								</div>
							</div>
						))}
					</div>
				</>
			) : (
				<div style={catalogStyles.detailHeader}>
					<div>
						<h2 style={{ ...catalogStyles.sectionTitle, marginBottom: 4 }}>{selectedCategory.name}</h2>
						<p style={{ margin: 0, color: "#5a6b63" }}>{selectedCategory.description}</p>
					</div>
					<button type="button" style={catalogStyles.backBtn} onClick={handleBackToCategories}>
						← Volver a categorías
					</button>
				</div>
			)}

			{selectedCategory && (
				<>
					<h3 style={{ margin: "12px 0" }}>Proveedores asociados</h3>
					{loadingProducts ? (
						<p>Cargando productos...</p>
					) : companyItemsForCategory.length === 0 ? (
						<div style={catalogStyles.emptyState}>No hay proveedores con productos en esta categoría.</div>
					) : (
						<div style={catalogStyles.productTableWrap}>
							<table style={catalogStyles.productTable}>
								<thead>
									<tr>
										{["Producto", "Proveedor", "Descripción", "Precio", "Acciones"].map((label) => (
											<th key={label} style={catalogStyles.productTableHeadCell}>
												{label}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{companyItemsForCategory.map((p) => (
										<tr key={p.id} style={catalogStyles.productTableRow}>
											<td style={catalogStyles.productTableCell}>
												<strong>{p.name}</strong>
												<p style={{ margin: "4px 0 0", color: "#5e6b64", fontSize: "0.85rem" }}>
													{p.categoriaNombre || selectedCategory.name}
												</p>
											</td>
											<td style={catalogStyles.productTableCell}>{p.ownerEmail || "Proveedor inscrito"}</td>
											<td style={catalogStyles.productTableCell}>{p.description}</td>
											<td style={catalogStyles.productTableCell}>
												{p.price > 0 ? `$${p.price.toLocaleString("es-CL")}` : "A convenir"}
											</td>
											<td style={catalogStyles.productTableCell}>
												<div style={catalogStyles.productActions}>
													<input
														type="number"
														min="1"
														value={quantities[p.id] || 1}
														onChange={(e) => handleQuantityChange(p.id, e.target.value)}
														style={catalogStyles.tableQtyInput}
													/>
													<button
														style={catalogStyles.tableBtn}
														onClick={() => handleAddToCart(p, quantities[p.id] || 1)}
													>
														Agregar
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Catalog;