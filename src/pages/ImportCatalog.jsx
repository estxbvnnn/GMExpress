import React, { useState } from "react";
import { collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { CATALOG } from "./Catalog";
import Swal from "sweetalert2";

const ImportCatalog = () => {
	const [loading, setLoading] = useState(false);

	const handleImport = async () => {
		const confirm = await Swal.fire({
			title: "Importar catálogo base",
			text: "Esto creará categorías y productos base en Firestore. ¿Continuar?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, importar",
			cancelButtonText: "Cancelar",
		});
		if (!confirm.isConfirmed) return;

		try {
			setLoading(true);

			for (const cat of CATALOG) {
				// crear/actualizar categoría
				const catRef = doc(db, "categorias", cat.id);
				await setDoc(
					catRef,
					{
						name: cat.name,
						description: cat.description,
						updatedAt: serverTimestamp(),
						createdAt: serverTimestamp(),
					},
					{ merge: true }
				);

				// productos base de esa categoría
				for (const item of cat.items) {
					const priceNumber = Number(item.price || 0);

					await addDoc(collection(db, "productos"), {
						name: item.name,
						description: item.short,
						ingredients: item.ingredients,
						conditions: item.conditions,
						price: isNaN(priceNumber) ? 0 : priceNumber,
						active: true,
						type: "Producto base",
						categoriaId: cat.id,
						categoriaNombre: cat.name,
						isDefault: true,
						createdAt: serverTimestamp(),
						updatedAt: serverTimestamp(),
					});
				}
			}

			await Swal.fire(
				"Importación completa",
				"El catálogo base fue importado a Firestore.",
				"success"
			);
		} catch (err) {
			console.error("Error importando catálogo base:", err);
			const msg =
				err && err.message
					? err.message
					: "Ocurrió un error al importar el catálogo.";
			Swal.fire("Error", msg, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page-container">
			<h1>Importar catálogo base a Firestore</h1>
			<p>
				Este módulo creará documentos en <b>categorias</b> y{" "}
				<b>productos</b> a partir del catálogo estático actual.
			</p>
			<button
				className="btn-primary"
				type="button"
				onClick={handleImport}
				disabled={loading}
			>
				{loading ? "Importando..." : "Importar catálogo base"}
			</button>
		</div>
	);
};

export default ImportCatalog;
