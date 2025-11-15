import { createContext, useContext, useEffect, useState } from "react";
import {
	onAuthStateChanged,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	signInWithPopup,
} from "firebase/auth";
import { auth, db, googleProvider } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// util simple para validar RUT chileno
const cleanRut = (rut) => rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

const validateRut = (rut) => {
	const value = cleanRut(rut);
	if (value.length < 8 || value.length > 9) return false;
	const body = value.slice(0, -1);
	const dv = value.slice(-1);

	let sum = 0;
	let multiplier = 2;
	for (let i = body.length - 1; i >= 0; i--) {
		sum += parseInt(body[i], 10) * multiplier;
		multiplier = multiplier === 7 ? 2 : multiplier + 1;
	}
	const expected = 11 - (sum % 11);
	let dvCalc = "";
	if (expected === 11) dvCalc = "0";
	else if (expected === 10) dvCalc = "K";
	else dvCalc = String(expected);

	return dvCalc === dv;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (!firebaseUser) {
					setUser(null);
					setLoading(false);
					return;
				}
				const userRef = doc(db, "usuarios", firebaseUser.uid);
				const snap = await getDoc(userRef);
				const profileData = snap.exists() ? snap.data() : {};
				setUser({
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName,
					role: profileData.role || "cliente",
					tipoUsuario: profileData.tipoUsuario || "Cliente",
					nombre: profileData.nombre,
					apellidoPaterno: profileData.apellidoPaterno,
					apellidoMaterno: profileData.apellidoMaterno,
					rut: profileData.rut,
				});
			} catch (err) {
				console.error("Error cargando perfil de usuario:", err);
				// Si hay error, al menos no dejamos la app colgada
				setUser(null);
			} finally {
				setLoading(false);
			}
		});
		return () => unsub();
	}, []);

	const register = async ({
		nombre,
		apellidoPaterno,
		apellidoMaterno,
		rut,
		email,
		password,
		tipoUsuario,
	}) => {
		if (!nombre || nombre.trim().length < 4 || nombre.trim().length > 20) {
			throw new Error("El nombre debe tener entre 4 y 20 caracteres.");
		}
		if (
			!apellidoPaterno ||
			apellidoPaterno.trim().length < 4 ||
			apellidoPaterno.trim().length > 20
		) {
			throw new Error(
				"El apellido paterno debe tener entre 4 y 20 caracteres."
			);
		}
		if (
			!apellidoMaterno ||
			apellidoMaterno.trim().length < 4 ||
			apellidoMaterno.trim().length > 20
		) {
			throw new Error(
				"El segundo apellido debe tener entre 4 y 20 caracteres."
			);
		}
		if (!rut || !validateRut(rut)) {
			throw new Error("RUT inválido, verifique el formato y dígito verificador.");
		}
		const emailTrim = (email || "").trim();
		if (
			!emailTrim ||
			emailTrim.length < 8 ||
			emailTrim.length > 45 ||
			!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrim)
		) {
			throw new Error(
				"Correo electrónico inválido. Debe tener entre 8 y 45 caracteres."
			);
		}
		if (!password || password.length < 6) {
			throw new Error("La contraseña debe tener al menos 6 caracteres.");
		}
		if (tipoUsuario !== "Cliente" && tipoUsuario !== "Empresa") {
			throw new Error("Debe seleccionar tipo de usuario: Cliente o Empresa.");
		}

		const displayName = `${nombre.trim()} ${apellidoPaterno.trim()}`;
		// crear usuario en Authentication (aquí queda autenticado)
		const cred = await createUserWithEmailAndPassword(auth, emailTrim, password);
		await updateProfile(cred.user, { displayName });

		// un registro normal nunca crea superadmin, solo cliente o empresa
		const role =
			tipoUsuario === "Empresa" ? "empresa" : "cliente";

		// guardar perfil en colección "usuarios"
		const userRef = doc(db, "usuarios", cred.user.uid);
		await setDoc(userRef, {
			nombre: nombre.trim(),
			apellidoPaterno: apellidoPaterno.trim(),
			apellidoMaterno: apellidoMaterno.trim(),
			rut: cleanRut(rut),
			email: emailTrim,
			tipoUsuario,
			role,
			createdAt: new Date(),
		});
	};

	const login = async ({ email, password }) => {
		if (!email || !password) {
			throw new Error("Debe ingresar correo y contraseña.");
		}
		// iniciar sesión
		const cred = await signInWithEmailAndPassword(auth, email, password);

		// refrescar perfil desde "usuarios" inmediatamente
		const userRef = doc(db, "usuarios", cred.user.uid);
		const snap = await getDoc(userRef);
		const profileData = snap.exists() ? snap.data() : {};

		setUser({
			uid: cred.user.uid,
			email: cred.user.email,
			displayName: cred.user.displayName,
			role: profileData.role || "cliente",
			tipoUsuario: profileData.tipoUsuario || "Cliente",
			nombre: profileData.nombre,
			apellidoPaterno: profileData.apellidoPaterno,
			apellidoMaterno: profileData.apellidoMaterno,
			rut: profileData.rut,
		});
	};

	const loginWithGoogle = async () => {
		await signInWithPopup(auth, googleProvider);
		// Si quisieras forzar capturar más datos (rut, apellidos) para Google,
		// podrías redirigir luego a una pantalla de completar perfil.
	};

	const logout = async () => {
		await signOut(auth);
	};

	const value = {
		user,
		loading,
		register,
		login,
		loginWithGoogle,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};