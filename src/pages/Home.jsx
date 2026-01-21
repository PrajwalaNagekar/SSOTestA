import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <h1>Home</h1>
      <p>SSO Login Successful ✅</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
