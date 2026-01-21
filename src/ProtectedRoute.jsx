import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
          { withCredentials: true }
        );

        // ✅ STORE USER DATA
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("userId", res.data.id);

        setIsAuth(true);
      } catch (err) {
        setIsAuth(false);
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <p>Checking authentication...</p>;

  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
