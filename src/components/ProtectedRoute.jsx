import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false }) => {
	const { user, loading } = useAuth();

	if (loading) return null;
	if (!user) return <Navigate to="/login" replace />;

	// rutas exclusivas de superadmin
	if (requireSuperAdmin && user.role !== "superadmin") {
		return <Navigate to="/" replace />;
	}

	// rutas de admin/empresa/superadmin (panel productos, etc.)
	if (requireAdmin && user.role !== "admin" && user.role !== "empresa" && user.role !== "superadmin") {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default ProtectedRoute;