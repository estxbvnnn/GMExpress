import { useEffect, useState } from "react";
import {
	collection,
	addDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
	serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext"; // NUEVO

// mismas categorías de nivel 1 del catálogo
const CATEGORIES = [
	{ id: "alimentacion-transportada", name: "Alimentación transportada" },
	{ id: "servicio-presencial", name: "Servicio presencial en sucursales" },
	{
		id: "concesion-casinos",
		name: "Concesión de casinos (colegios/universidades)",
	},
	{ id: "coffee-break-eventos", name: "Coffee break y eventos" },
	{ id: "reposteria-snack", name: "Repostería y snack con tickets" },
];

const AdminProducts = () => {
	const { user } = useAuth(); // NUEVO: usuario autenticado (empresa/admin/superadmin)

	const [products, setProducts] = useState([]);
	const [form, setForm] = useState({
		name: "",
		description: "",
		ingredients: "",
		conditions: "",
		price: "",
		type: "Producto",
		active: true,
		categoriaId: "alimentacion-transportada",
	});
	const [imageFile, setImageFile] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const loadProducts = async () => {
		try {
			if (!user) return;
			const snap = await getDocs(collection(db, "productos"));
			const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

			// Solo productos de esta empresa/usuario
			const ownProducts = data.filter((p) => p.ownerId === user.uid);

			setProducts(ownProducts);
		} catch (err) {
			setError("Error al cargar productos.");
			Swal.fire("Error", "Error al cargar productos.", "error");
		}
	};

	useEffect(() => {
		if (user) {
			loadProducts();
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const validateForm = () => {
		if (!form.name || form.name.trim().length < 3)
			throw new Error("El nombre debe tener al menos 3 caracteres.");
		if (!form.description || form.description.trim().length < 10)
			throw new Error("La descripción debe tener al menos 10 caracteres.");
		if (!form.ingredients || form.ingredients.trim().length < 10)
			throw new Error(
				"Los ingredientes/componentes deben tener al menos 10 caracteres."
			);
		if (!form.conditions || form.conditions.trim().length < 10)
			throw new Error(
				"Las condiciones de entrega/consumo deben tener al menos 10 caracteres."
			);
		const priceNumber = Number(form.price);
		if (isNaN(priceNumber) || priceNumber < 0)
			throw new Error("El precio debe ser un número mayor o igual a 0.");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			if (!user) {
				throw new Error("No hay sesión activa.");
			}
			setLoading(true);
			validateForm();

			let imageUrl = null;
			if (imageFile) {
				const imageRef = ref(
					storage,
					`products/${Date.now()}-${imageFile.name}`
				);
				const snap = await uploadBytes(imageRef, imageFile);
				imageUrl = await getDownloadURL(snap.ref);
			}

			const categoria = CATEGORIES.find(
				(c) => c.id === form.categoriaId
			);

			const baseData = {
				name: form.name.trim(),
				description: form.description.trim(),
				ingredients: form.ingredients.trim(),
				conditions: form.conditions.trim(),
				type: form.type,
				price: Number(form.price),
				active: form.active,
				imageUrl: imageUrl || form.imageUrl || null,
				categoriaId: form.categoriaId,
				categoriaNombre: categoria?.name || "",
				ownerId: user.uid, // NUEVO: dueño del producto
				ownerEmail: user.email || null, // opcional
				updatedAt: serverTimestamp(),
			};

			if (editingId) {
				const docRef = doc(db, "productos", editingId);
				await updateDoc(docRef, baseData);
			} else {
				await addDoc(collection(db, "productos"), {
					...baseData,
					createdAt: serverTimestamp(),
				});
			}

			setForm({
				name: "",
				description: "",
				ingredients: "",
				conditions: "",
				price: "",
				type: "Producto",
				active: true,
				categoriaId: "alimentacion-transportada",
			});
			setImageFile(null);
			setEditingId(null);
			await loadProducts();
			Swal.fire(
				"Guardado",
				"El producto fue guardado correctamente.",
				"success"
			);
		} catch (err) {
			const msg = err.message || "Error al guardar producto.";
			setError(msg);
			Swal.fire("Error", msg, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (prod) => {
		setEditingId(prod.id);
		setForm({
			name: prod.name,
			description: prod.description,
			ingredients: prod.ingredients || "",
			conditions: prod.conditions || "",
			price: prod.price,
			type: prod.type || "Producto",
			active: prod.active,
			imageUrl: prod.imageUrl || null,
			categoriaId: prod.categoriaId || "alimentacion-transportada",
		});
	};

	const handleDelete = async (id) => {
		const res = await Swal.fire({
			title: "¿Eliminar producto?",
			text: "Esta acción no se puede deshacer.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		});
		if (!res.isConfirmed) return;
		try {
			await deleteDoc(doc(db, "productos", id));
			await loadProducts();
			Swal.fire("Eliminado", "El producto fue eliminado.", "success");
		} catch (err) {
			Swal.fire("Error", "No se pudo eliminar el producto.", "error");
		}
	};

	return (
		<div className="page-container">
			<h1>Panel Empresa: Productos del Catálogo</h1>
			<form className="admin-form" onSubmit={handleSubmit}>
				{error && <div className="error-msg">{error}</div>}
				<div className="form-grid">
					<label>
						Nombre del plato / producto
						<input
							name="name"
							value={form.name}
							onChange={handleChange}
							required
							minLength={3}
						/>
					</label>
					<label>
						Precio (CLP)
						<input
							name="price"
							type="number"
							min={0}
							value={form.price}
							onChange={handleChange}
							required
						/>
					</label>
					<label>
						Categoría del catálogo
						<select
							name="categoriaId"
							value={form.categoriaId}
							onChange={handleChange}
						>
							{CATEGORIES.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</label>
					<label className="checkbox-inline">
						<input
							type="checkbox"
							name="active"
							checked={form.active}
							onChange={handleChange}
						/>
						Activo en catálogo
					</label>
				</div>
				<label>
					Descripción breve
					<textarea
						name="description"
						value={form.description}
						onChange={handleChange}
						minLength={10}
						required
					/>
				</label>
				<label>
					Ingredientes / componentes principales
					<textarea
						name="ingredients"
						value={form.ingredients}
						onChange={handleChange}
						minLength={10}
						required
					/>
				</label>
				<label>
					Condiciones de entrega / consumo
					<textarea
						name="conditions"
						value={form.conditions}
						onChange={handleChange}
						minLength={10}
						required
					/>
				</label>
				<label>
					Imagen (opcional)
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setImageFile(e.target.files[0] || null)}
					/>
				</label>
				<button className="btn-primary" type="submit" disabled={loading}>
					{loading
						? "Guardando..."
						: editingId
						? "Actualizar"
						: "Crear producto/servicio"}
				</button>
			</form>

			<h2>Listado actual</h2>
			<table className="admin-table">
				<thead>
					<tr>
						<th>Nombre</th>
						<th>Categoría</th>
						<th>Precio</th>
						<th>Activo</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{products.map((p) => (
						<tr key={p.id}>
							<td>{p.name}</td>
							<td>{p.categoriaNombre || "-"}</td>
							<td>${p.price?.toLocaleString("es-CL")}</td>
							<td>{p.active ? "Sí" : "No"}</td>
							<td>
								<button
									className="btn-table"
									onClick={() => handleEdit(p)}
								>
									Editar
								</button>
								<button
									className="btn-table-danger"
									onClick={() => handleDelete(p.id)}
								>
									Eliminar
								</button>
							</td>
						</tr>
					))}
					{products.length === 0 && (
						<tr>
							<td colSpan="5">Sin productos registrados para esta cuenta.</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default AdminProducts;