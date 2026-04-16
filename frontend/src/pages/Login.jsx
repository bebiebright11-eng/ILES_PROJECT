import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    try {
      const res = await API.post("accounts/login/", {
        username: username,
        password: password,
      });

      // Save credentials
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", res.data.role);
      // Added user_id to localStorage for role-based filtering in dashboards
      localStorage.setItem("user_id", res.data.user_id);

      alert("SUCCESS: Logged in as " + res.data.role);

      const role = res.data.role.toLowerCase();
      if (role === "student") {
        navigate("/student");
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "workplace") {
        navigate("/workplace");
      } else if (role === "academic") {
        navigate("/academic");
      } else {
        alert("Unknown role: " + role);
     }

//
      //if (role === "student") {
      //  navigate("/student");
     // } else if (role === "admin") {
      //  navigate("/admin");
      //} else {
      //  alert("Logged in! But dashboard for " + role + " is missing.");
     // }

    } catch (error) {
      if (error.response) {
        // Django rejected the credentials
        alert("DJANGO ERROR: " + JSON.stringify(error.response.data));
      } else {
        // Request never reached Django
        alert("NETWORK ERROR: 1. Restart Vite terminal. 2. Ensure Django is running.");
      }
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;