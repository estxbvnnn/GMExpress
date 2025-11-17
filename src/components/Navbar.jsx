import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gmexpressLogo from "../assets/img/gmexpresshorizontal.png";

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const normalizeRole = (value) => (value || "").toLowerCase();
	const userRole =
		normalizeRole(user?.role) || normalizeRole(user?.tipoUsuario) || "";
	const isCompanyUser = userRole === "empresa";
	const isClientUser = userRole === "cliente";
	const canUseCart = isClientUser;

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const handleGoPanel = () => {
		if (!user) {
			navigate("/login");
			return;
		}
		if (user.role === "empresa" || user.role === "admin" || user.role === "superadmin") {
			navigate("/admin/productos");
		} else {
			navigate("/mis-pedidos");
		}
	};

	const handleGoAdminPanel = () => {
		if (!user) return;
		navigate("/admin");
	};

	return (
		<header className="navbar">
			<div className="navbar-left">
				<Link to="/" className="logo">
					<img
						src={gmexpressLogo}
						alt="GM Express"
						style={{ height: 48, display: "block" }}
					/>
				</Link>
			</div>

			<nav className="navbar-center">
				<button
					type="button"
					className="btn-secondary"
					onClick={() => navigate("/")}
				>
					Inicio
				</button>
				<Link to="/catalogo" style={{ margin: "0 10px" }}>
					Catálogo
				</Link>

				{user &&
					(user.role === "empresa" ||
						user.role === "admin" ||
						user.role === "superadmin") && (
						<button
							type="button"
							className="btn-primary"
							onClick={handleGoPanel}
						>
							Panel
						</button>
					)}

				{isClientUser && (
					<>
						<Link to="/carrito">Mi carrito</Link>
						<Link to="/mis-pedidos">Mis pedidos</Link>
					</>
				)}
				{isCompanyUser && (
					<Link to="/mis-pedidos">Solicitudes clientes</Link>
				)}
			</nav>

			<div className="navbar-right">
				{user ? (
					<>
						<button
							type="button"
							className="btn-secondary"
							onClick={() => navigate("/mi-perfil")}
						>
							Mi perfil
						</button>

						<span className="navbar-user">
							{user.displayName || user.email}
						</span>

						{user.role === "superadmin" && (
							<button
								type="button"
								className="btn-admin-panel"
								onClick={handleGoAdminPanel}
							>
								Admin Panel
							</button>
						)}

						<button className="btn-secondary" onClick={handleLogout}>
							Salir
						</button>
					</>
				) : (
					<>
						<Link to="/login" className="btn-secondary">
							Ingresar
						</Link>
						<Link to="/register" className="btn-primary">
							Registrarse
						</Link>
					</>
				)}
			</div>
		</header>
	);
};

export default Navbar;