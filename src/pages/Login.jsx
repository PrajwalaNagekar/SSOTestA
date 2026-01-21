import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // To show loading state
  const [error, setError] = useState(""); // Better error handling

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleLogin = async () => {
  setError("");
  setLoading(true);

  if (!form.email || !form.password) {
    setError("Please enter both email and password");
    setLoading(false);
    return;
  }

  try {
    // ✅ Login (cookie will be set by backend)
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      {
        email: form.email.trim(),
        password: form.password,
      },
      { withCredentials: true }
    );

    // ✅ Verify session (this proves cookie is working)
    // await axios.get(
    //   `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
    //   { withCredentials: true }
    // );

    // ✅ Success
    navigate("/home", { replace: true });

  } catch (err) {
    console.error("Login failed:", err);

    if (err.response) {
      setError(err.response.data?.message || "Invalid email or password");
    } else {
      setError("Cannot connect to server");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>Login</h2>

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "16px" }}>
          {error}
        </p>
      )}

      {/* Email Input */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          border: "1px solid #aaa",
          borderRadius: "6px",
          fontSize: "16px",
        }}
      />

      {/* Password Input */}
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          border: "1px solid #aaa",
          borderRadius: "6px",
          fontSize: "16px",
        }}
      />

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#999" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Optional: Helpful hint */}
      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
        Don't have an account? <a href="/register">Sign up</a>
      </p>
    </div>
  );
}