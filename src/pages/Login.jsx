// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false); // To show loading state
//   const [error, setError] = useState(""); // Better error handling

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//  const handleLogin = async () => {
//   setError("");
//   setLoading(true);

//   if (!form.email || !form.password) {
//     setError("Please enter both email and password");
//     setLoading(false);
//     return;
//   }

//   try {
//     // ✅ Login (cookie will be set by backend)
//     await axios.post(
//       `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
//       {
//         email: form.email.trim(),
//         password: form.password,
//       },
//       { withCredentials: true }
//     );

//     // ✅ Verify session (this proves cookie is working)
//     // await axios.get(
//     //   `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
//     //   { withCredentials: true }
//     // );

//     // ✅ Success
//     navigate("/home", { replace: true });

//   } catch (err) {
//     console.error("Login failed:", err);

//     if (err.response) {
//       setError(err.response.data?.message || "Invalid email or password");
//     } else {
//       setError("Cannot connect to server");
//     }
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div
//       style={{
//         maxWidth: "400px",
//         margin: "50px auto",
//         padding: "30px",
//         border: "1px solid #ccc",
//         borderRadius: "10px",
//         boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
//         fontFamily: "Arial, sans-serif",
//       }}
//     >
//       <h2 style={{ textAlign: "center", marginBottom: "24px" }}>Login</h2>

//       {/* Error Message */}
//       {error && (
//         <p style={{ color: "red", textAlign: "center", marginBottom: "16px" }}>
//           {error}
//         </p>
//       )}

//       {/* Email Input */}
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         value={form.email}
//         onChange={handleChange}
//         required
//         style={{
//           width: "100%",
//           padding: "12px",
//           marginBottom: "12px",
//           border: "1px solid #aaa",
//           borderRadius: "6px",
//           fontSize: "16px",
//         }}
//       />

//       {/* Password Input */}
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         value={form.password}
//         onChange={handleChange}
//         required
//         style={{
//           width: "100%",
//           padding: "12px",
//           marginBottom: "20px",
//           border: "1px solid #aaa",
//           borderRadius: "6px",
//           fontSize: "16px",
//         }}
//       />

//       {/* Login Button */}
//       <button
//         onClick={handleLogin}
//         disabled={loading}
//         style={{
//           width: "100%",
//           padding: "12px",
//           backgroundColor: loading ? "#999" : "#007bff",
//           color: "white",
//           border: "none",
//           borderRadius: "6px",
//           fontSize: "16px",
//           cursor: loading ? "not-allowed" : "pointer",
//         }}
//       >
//         {loading ? "Logging in..." : "Login"}
//       </button>

//       {/* Optional: Helpful hint */}
//       <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
//         Don't have an account? <a href="/register">Sign up</a>
//       </p>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get redirect_uri from query params (comes from App B)
  const redirectUri = searchParams.get("redirect_uri");

  useEffect(() => {
    // Check if user is already logged into App A
    const checkSession = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
          { withCredentials: true }
        );
        
        // User is already logged in
        if (response.data && redirectUri) {
          // Generate SSO token and redirect back to App B
          generateSSOTokenAndRedirect(response.data);
        } else if (response.data) {
          // User is logged in but no redirect_uri - go to App A's home
          navigate("/home", { replace: true });
        }
      } catch (err) {
        // Not logged in - stay on login page
        console.log("User not logged into App A");
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, redirectUri]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Function to generate SSO token and redirect back to App B
  const generateSSOTokenAndRedirect = async (userData) => {
    try {
      // Get SSO token from backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/generate-sso-token`,
        { user: userData },
        { withCredentials: true }
      );
      
      const { ssoToken } = response.data;
      
      // Redirect back to App B with the token
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set("token", ssoToken);
      
      window.location.href = redirectUrl.toString();
    } catch (err) {
      console.error("Failed to generate SSO token:", err);
      setError("Failed to generate SSO token");
    }
  };

  // Regular login to App A
  const handleLogin = async () => {
    setError("");
    
    if (!form.email || !form.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // Login to App A
      const loginResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          email: form.email.trim(),
          password: form.password,
        },
        { withCredentials: true }
      );

      // If there's a redirect_uri, this is SSO login
      if (redirectUri) {
        // Generate SSO token and redirect back to App B
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
          { withCredentials: true }
        );
        
        await generateSSOTokenAndRedirect(userResponse.data);
      } else {
        // Regular login to App A
        navigate("/home", { replace: true });
      }

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

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div style={{
        maxWidth: "400px",
        margin: "50px auto",
        textAlign: "center",
        padding: "30px"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }}></div>
        <p>Checking your session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>
        {redirectUri ? "Login to App A (SSO)" : "Login to App A"}
      </h2>

      {/* SSO Info Banner */}
      {redirectUri && (
        <div style={{
          backgroundColor: "#e3f2fd",
          padding: "12px",
          borderRadius: "6px",
          marginBottom: "20px",
          fontSize: "14px",
          borderLeft: "4px solid #2196f3"
        }}>
          <strong>🔐 SSO Login Request</strong>
          <p style={{ margin: "8px 0 0", fontSize: "12px" }}>
            You're logging in to access <strong>App B</strong>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: "#721c24", 
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          padding: "12px",
          borderRadius: "6px",
          marginBottom: "16px",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      {/* Email Input */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          required
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #aaa",
            borderRadius: "6px",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Password Input */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          required
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #aaa",
            borderRadius: "6px",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#999" : (redirectUri ? "#2196f3" : "#007bff"),
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "600",
          transition: "background-color 0.2s"
        }}
        onMouseOver={(e) => {
          if (!loading && redirectUri) e.target.style.backgroundColor = "#1976d2";
          if (!loading && !redirectUri) e.target.style.backgroundColor = "#0056b3";
        }}
        onMouseOut={(e) => {
          if (!loading && redirectUri) e.target.style.backgroundColor = "#2196f3";
          if (!loading && !redirectUri) e.target.style.backgroundColor = "#007bff";
        }}
      >
        {loading ? (
          <>
            <span style={{ marginRight: "8px" }}>⏳</span>
            {redirectUri ? "Redirecting..." : "Logging in..."}
          </>
        ) : redirectUri ? (
          "Continue to App B"
        ) : (
          "Login to App A"
        )}
      </button>

      {/* Back to App B link (only shown in SSO flow) */}
      {redirectUri && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => {
              // Go back to App B without logging in
              const url = new URL(redirectUri);
              url.searchParams.set("error", "user_cancelled");
              window.location.href = url.toString();
            }}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline"
            }}
          >
            ← Cancel and return to App B
          </button>
        </div>
      )}

      {/* Regular signup link (only shown when not in SSO flow) */}
      {!redirectUri && (
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
          Don't have an account? <a href="/register" style={{ color: "#2196f3" }}>Sign up</a>
        </p>
      )}

      {/* Debug info (remove in production) */}
      <div style={{
        marginTop: "30px",
        padding: "12px",
        backgroundColor: "#f8f9fa",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#666",
        border: "1px dashed #ddd"
      }}>
        <div><strong>Debug Info:</strong></div>
        <div>App A: {window.location.origin}</div>
        <div>Redirect URI: {redirectUri || "None (regular login)"}</div>
      </div>
    </div>
  );
}