import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const Login = () => {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			setLoading(true);
			await login({ email, password });
			await Swal.fire("Bienvenido", "Inicio de sesión correcto.", "success");
			navigate("/catalogo");
		} catch (err) {
			const msg = err.message || "Error al iniciar sesión.";
			setError(msg);
			Swal.fire("Error", msg, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<h1>Iniciar Sesión</h1>
			<form onSubmit={handleSubmit} className="auth-form">
				{error && <div className="error-msg">{error}</div>}
				<label>
					Correo electrónico
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
				<button type="submit" className="btn-primary" disabled={loading}>
					{loading ? "Ingresando..." : "Ingresar"}
				</button>
			</form>
			<p>
				¿No tienes cuenta? <Link to="/register">Regístrate</Link>
			</p>
		</div>
	);
};

export default Login;