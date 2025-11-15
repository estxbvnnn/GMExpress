import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const Register = () => {
	const { register } = useAuth();
	const [nombre, setNombre] = useState("");
	const [apellidoPaterno, setApellidoPaterno] = useState("");
	const [apellidoMaterno, setApellidoMaterno] = useState("");
	const [rut, setRut] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [tipoUsuario, setTipoUsuario] = useState("Cliente");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden.");
			Swal.fire("Error", "Las contraseñas no coinciden.", "error");
			return;
		}
		try {
			setLoading(true);
			await register({
				nombre,
				apellidoPaterno,
				apellidoMaterno,
				rut,
				email,
				password,
				tipoUsuario,
			});
			await Swal.fire(
				"Registro correcto",
				"Tu cuenta se creó correctamente.",
				"success"
			);
			navigate("/catalogo");
		} catch (err) {
			const msg =
				err.code === "permission-denied"
					? "No tienes permisos para registrar en la base de datos."
					: err.message || "Error al registrarse.";
			setError(msg);
			Swal.fire("Error", msg, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<h1>Registro de Usuario</h1>
			<form onSubmit={handleSubmit} className="auth-form">
				{error && <div className="error-msg">{error}</div>}
				<label>
					Nombre
					<input
						type="text"
						value={nombre}
						onChange={(e) => setNombre(e.target.value)}
						minLength={4}
						maxLength={20}
						required
					/>
				</label>
				<label>
					Apellido paterno
					<input
						type="text"
						value={apellidoPaterno}
						onChange={(e) => setApellidoPaterno(e.target.value)}
						minLength={4}
						maxLength={20}
						required
					/>
				</label>
				<label>
					Apellido materno
					<input
						type="text"
						value={apellidoMaterno}
						onChange={(e) => setApellidoMaterno(e.target.value)}
						minLength={4}
						maxLength={20}
						required
					/>
				</label>
				<label>
					RUT
					<input
						type="text"
						placeholder="12.345.678-9"
						value={rut}
						onChange={(e) => setRut(e.target.value)}
						required
					/>
				</label>
				<label>
					Correo electrónico
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						minLength={8}
						maxLength={45}
						required
					/>
				</label>
				<label>
					Contraseña
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						minLength={6}
						required
					/>
				</label>
				<label>
					Confirmar contraseña
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						minLength={6}
						required
					/>
				</label>
				<label>
					Tipo de usuario
					<select
						value={tipoUsuario}
						onChange={(e) => setTipoUsuario(e.target.value)}
						required
					>
						<option value="Cliente">Cliente</option>
						<option value="Empresa">Empresa</option>
					</select>
				</label>
				<button type="submit" className="btn-primary" disabled={loading}>
					{loading ? "Registrando..." : "Registrarse"}
				</button>
			</form>
			<p>
				¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
			</p>
		</div>
	);
};

export default Register;