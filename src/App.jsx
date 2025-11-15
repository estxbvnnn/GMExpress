import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import AdminProducts from "./pages/AdminProducts";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import ImportCatalog from "./pages/ImportCatalog";
import MiPerfil from "./pages/MiPerfil";

function App() {
	return (
		<div className="app-root">
			<Navbar />
			<main className="main-content">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/catalogo" element={<Catalog />} />

					<Route
						path="/mi-perfil"
						element={
							<ProtectedRoute>
								<MiPerfil />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/productos"
						element={
							<ProtectedRoute requireAdmin={true}>
								<AdminProducts />
							</ProtectedRoute>
						}
					/>

					{/* Admin Panel solo superadmin */}
					<Route
						path="/admin"
						element={
							<ProtectedRoute requireSuperAdmin={true}>
								<AdminPanel />
							</ProtectedRoute>
						}
					/>

					{/* NUEVO: Importar catálogo (solo superadmin) */}
					<Route
						path="/admin/import-catalogo"
						element={
							<ProtectedRoute requireSuperAdmin={true}>
								<ImportCatalog />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/carrito"
						element={
							<ProtectedRoute>
								<Cart />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/mis-pedidos"
						element={
							<ProtectedRoute>
								<Orders />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</main>
		</div>
	);
}

export default App;