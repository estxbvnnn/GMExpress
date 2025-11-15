import { useAuth } from "../context/AuthContext";

const MiPerfil = () => {
	const { user } = useAuth();

	if (!user) {
		return (
			<div className="page-container">
				<h1>Mi perfil</h1>
				<p>No hay sesión activa.</p>
			</div>
		);
	}

	const initials = (
		(user.nombre || user.displayName || user.email || "?")
			.split(" ")
			.map((p) => p[0])
			.join("")
			.slice(0, 2)
			.toUpperCase()
	);

	return (
		<div className="page-container">
			<h1>Mi perfil</h1>
			<div className="profile-header">
				<div className="profile-avatar">
					<span>{initials}</span>
				</div>
				<div className="profile-main">
					<h2>{user.nombre || user.displayName || "Usuario"}</h2>
					<p className="profile-role">
						{user.tipoUsuario || "Cliente"} · Rol: {user.role || "cliente"}
					</p>
				</div>
			</div>

			<div className="profile-grid">
				<div className="profile-card">
					<h3>Datos personales</h3>
					<p>
						<b>Nombre:</b>{" "}
						{user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
					</p>
					<p>
						<b>RUT:</b> {user.rut || "-"}
					</p>
				</div>
				<div className="profile-card">
					<h3>Contacto</h3>
					<p>
						<b>Correo:</b> {user.email}
					</p>
					<p>
						<b>Tipo de usuario:</b> {user.tipoUsuario || "Cliente"}
					</p>
				</div>
			</div>
		</div>
	);
};

export default MiPerfil;
