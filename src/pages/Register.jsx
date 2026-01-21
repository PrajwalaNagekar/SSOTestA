import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    // Reset messages
    setError("");
    setSuccess(false);

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      console.log("Register success:", res.data);

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500); // Give user time to see success message
    } catch (err) {
      console.error("Registration failed:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";

      setError(message);
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
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>
        Create Account
      </h2>

      {/* Success Message */}
      {success && (
        <p
          style={{
            color: "green",
            textAlign: "center",
            marginBottom: "16px",
            fontWeight: "bold",
          }}
        >
          Registered successfully! Redirecting to login...
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          style={{
            color: "red",
            textAlign: "center",
            marginBottom: "16px",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          {error}
        </p>
      )}

      {/* Name Input */}
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
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

      {/* Email Input */}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
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
        placeholder="Password (min 6 characters)"
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

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#999" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Creating Account..." : "Register"}
      </button>

      {/* Login Link */}
      <p
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "#555",
        }}
      >
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          style={{
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Login here
        </span>
      </p>
    </div>
  );
}