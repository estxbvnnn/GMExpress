import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gmexpressLogo from "../assets/img/gmexpresshorizontal.png";

const cartButtonStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 6,
	padding: "10px 22px",
	borderRadius: 999,
	background: "linear-gradient(120deg,#3dd598,#00a86b)",
	color: "#042414",
	fontWeight: 600,
	border: "none",
	textDecoration: "none",
	boxShadow: "0 14px 24px rgba(4,32,20,0.18)",
	transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const normalizeRole = (value = "") => value.toLowerCase();
	const userRole =
		normalizeRole(user?.role) || normalizeRole(user?.tipoUsuario) || "";
	const isCompanyUser = userRole === "empresa";
	const canUseCart = Boolean(user) && !isCompanyUser;

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

	const handleCartButtonHover = (event, hovered) => {
		event.currentTarget.style.transform = hovered ? "translateY(-2px)" : "translateY(0)";
		event.currentTarget.style.boxShadow = hovered
			? "0 18px 32px rgba(4,32,20,0.25)"
			: cartButtonStyle.boxShadow;
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

				{canUseCart && (
					<Link
						to="/carrito"
						style={cartButtonStyle}
						onMouseEnter={(e) => handleCartButtonHover(e, true)}
						onMouseLeave={(e) => handleCartButtonHover(e, false)}
					>
						Ir al carrito
					</Link>
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