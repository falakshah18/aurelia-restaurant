import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const STAFF_ROLES = ["waiter", "chef", "cashier", "manager", "admin"];

export default function ProtectedRoute({ children, adminOnly = false, allowedRoles }) {
  const { user } = useAuth();

  if (user === null) {
    return (
      <div className="min-h-screen grid place-items-center text-gold font-forum text-2xl">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const roleAllowed = allowedRoles ? allowedRoles.includes(user.role) : true;
  const isAdmin = user.role === "admin";
  const isStaff = STAFF_ROLES.includes(user.role);

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (allowedRoles && !roleAllowed) return <Navigate to="/" replace />;
  if (!isAdmin && !isStaff) return <Navigate to="/" replace />;

  return children;
}
