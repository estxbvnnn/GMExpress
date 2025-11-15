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
		const stored = JSON.parse(localStorage.getItem("cart") || "[]");
		const existing = stored.find((p) => p.id === product.id);
		let updated;
		if (existing) {
			updated = stored.map((p) =>
				p.id === product.id
					? { ...p, quantity: (p.quantity || 0) + qty }
					: p
			);
		} else {
			updated = [
				...stored,
				{
					...product,
					type: selectedCategory?.name || product.categoriaNombre,
					quantity: qty,
				},
			];
		}
		localStorage.setItem("cart", JSON.stringify(updated));
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

	return (
		<div className="page-container">
			<h1>Catálogo de Productos y Servicios</h1>

			{/* Breadcrumb simple */}
			<div className="catalog-breadcrumb">
				<span
					className={!selectedCategory ? "breadcrumb-active" : "breadcrumb-link"}
					onClick={handleBackToCategories}
				>
					Categorías
				</span>
				{selectedCategory && (
					<>
						<span className="breadcrumb-sep">/</span>
						<span
							className={
								!selectedItem ? "breadcrumb-active" : "breadcrumb-link"
							}
							onClick={handleBackToItems}
						>
							{selectedCategory.name}
						</span>
					</>
				)}
				{selectedItem && (
					<>
						<span className="breadcrumb-sep">/</span>
						<span className="breadcrumb-active">{selectedItem.name}</span>
					</>
				)}
			</div>

			{/* Nivel 1: listado de categorías */}
			{!selectedCategory && (
				<div className="catalog-grid catalog-grid-categories">
					{CATALOG.map((cat) => (
						<div
							key={cat.id}
							className="catalog-card catalog-card-category"
							onClick={() => {
								setSelectedCategoryId(cat.id);
								setSelectedItemId(null);
							}}
						>
							<div className="catalog-card-body">
								<h3>{cat.name}</h3>
								<p className="catalog-description">{cat.description}</p>
								{/* Puedes quitar este conteo si ya no usas items estáticos */}
								<span className="badge-count">Productos disponibles</span>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Nivel 2: productos dentro de la categoría (solo productos de BD) */}
			{selectedCategory && !selectedItem && (
				<>
					<p className="catalog-category-summary">
						{selectedCategory.description}
					</p>

					<h3>
						Productos del catálogo de {selectedCategory.name}
					</h3>
					{loadingProducts ? (
						<p>Cargando productos...</p>
					) : companyItemsForCategory.length === 0 ? (
						<p>No hay productos para esta categoría.</p>
					) : (
						<div className="catalog-grid">
							{companyItemsForCategory.map((p) => (
								<div
									key={p.id}
									className="catalog-card catalog-card-item"
								>
									<div className="catalog-card-body">
										<h3>{p.name}</h3>
										<p className="catalog-description">
											{p.description}
										</p>
										{p.price > 0 && (
											<p className="catalog-price">
												${p.price.toLocaleString("es-CL")}
											</p>
										)}
									</div>
									<div className="catalog-card-footer">
										{/* NUEVO: selector de cantidad */}
										<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
											<label style={{ fontSize: "0.8rem", color: "#666" }}>
												Cant.
											</label>
											<input
												type="number"
												min="1"
												value={quantities[p.id] || 1}
												onChange={(e) =>
													handleQuantityChange(p.id, e.target.value)
												}
												style={{
													width: 60,
													borderRadius: 999,
													border: "1px solid #ddd",
													padding: "4px 8px",
													fontSize: "0.85rem",
												}}
											/>
										</div>
										<button
											className="btn-primary"
											onClick={() =>
												handleAddToCart(p, quantities[p.id] || 1)
											}
										>
											Agregar al carrito
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</>
			)}

			{/* Nivel 3 (detalle estático) ya no es necesario si solo usas productos de BD.
			    Puedes eliminar este bloque si no lo usas en otra parte. */}
		</div>
	);
};

export default Catalog;