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

// Utils RUT
const cleanRut = (rut) =>
	rut ? rut.replace(/\./g, "").replace(/-/g, "").toUpperCase() : "";

const validateRut = (rut) => {
	const value = cleanRut(rut);
	if (!value || value.length < 8 || value.length > 9) return false;
	const body = value.slice(0, -1);
	const dv = value.slice(-1).toUpperCase();
	let sum = 0;
	let mult = 2;
	for (let i = body.length - 1; i >= 0; i--) {
		sum += parseInt(body[i], 10) * mult;
		mult = mult === 7 ? 2 : mult + 1;
	}
	const expected = 11 - (sum % 11);
	const dvCalc = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
	return dvCalc === dv;
};

// NUEVO: util para validar solo letras + espacios
const onlyLetters = (value) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value || "");

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Mantener sesión y perfil siempre sincronizados
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

				const composedUser = {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName,
					role: profileData.role || "cliente",
					tipoUsuario: profileData.tipoUsuario || "Cliente",
					nombre: profileData.nombre,
					apellidoPaterno: profileData.apellidoPaterno,
					apellidoMaterno: profileData.apellidoMaterno,
					rut: profileData.rut,
				};
				console.log("AuthContext onAuthStateChanged ->", composedUser);
				setUser(composedUser);
			} catch (err) {
				console.error("Error cargando perfil de usuario:", err);
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
		// VALIDACIONES TEXTO (sin números)
		if (!nombre || nombre.trim().length < 4 || nombre.trim().length > 20) {
			throw new Error("El nombre debe tener entre 4 y 20 caracteres.");
		}
		if (!onlyLetters(nombre)) {
			throw new Error("El nombre solo puede contener letras y espacios.");
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
		if (!onlyLetters(apellidoPaterno)) {
			throw new Error(
				"El apellido paterno solo puede contener letras y espacios."
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
		if (!onlyLetters(apellidoMaterno)) {
			throw new Error(
				"El segundo apellido solo puede contener letras y espacios."
			);
		}

		// VALIDACIONES RUT/EMAIL/CLAVE/TIPO
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
			throw new Error("Tipo de usuario inválido.");
		}

		const displayName = `${nombre.trim()} ${apellidoPaterno.trim()}`;
		const cred = await createUserWithEmailAndPassword(auth, emailTrim, password);
		await updateProfile(cred.user, { displayName });

		const role = tipoUsuario === "Empresa" ? "empresa" : "cliente";

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
			throw new Error("Debes ingresar correo y contraseña.");
		}
		const cred = await signInWithEmailAndPassword(auth, email, password);

		const userRef = doc(db, "usuarios", cred.user.uid);
		const snap = await getDoc(userRef);
		const profileData = snap.exists() ? snap.data() : {};

		const composedUser = {
			uid: cred.user.uid,
			email: cred.user.email,
			displayName: cred.user.displayName,
			role: profileData.role || "cliente",
			tipoUsuario: profileData.tipoUsuario || "Cliente",
			nombre: profileData.nombre,
			apellidoPaterno: profileData.apellidoPaterno,
			apellidoMaterno: profileData.apellidoMaterno,
			rut: profileData.rut,
		};
		console.log("AuthContext login ->", composedUser);
		setUser(composedUser);
	};

	const loginWithGoogle = async () => {
		await signInWithPopup(auth, googleProvider);
	};

	const logout = async () => {
		await signOut(auth);
		setUser(null);
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