import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function ActivateAccount() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");
  const navigate = useNavigate();

const handleActivate = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setMessage("");

  try {
    await API.post("accounts/activate/", {
      username,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    setMessage("Account activated successfully. You can now login.");
    setTimeout(() => {
  navigate("/");
}, 2000);

    // clear form
    setUsername("");
    setPassword("");
    setFirstName("");
    setLastName("");

  } catch (err) {
    if (err.response) {
      setError(err.response.data.error || "Activation failed");
    } else {
      setError("Network error. Try again.");
    }
  }

  setLoading(false);
};


  return (
    <div style={{ padding: "40px" }}>
      <h2>Activate Account</h2>

{error && <p style={{ color: "red" }}>{error}</p>}
{message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleActivate}>
        <input
          type="text"
          placeholder="Enter Registration Number or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <br /><br />

        <input
  type="text"
  placeholder="First Name"
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  required
/>
<br /><br />

<input
  type="text"
  placeholder="Last Name"
  value={lastName}
  onChange={(e) => setLastName(e.target.value)}
  required
/>
<br /><br />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

<button type="submit" disabled={loading}>
  {loading ? "Activating..." : "Activate"}
</button>
      </form>
    </div>
  );
}

export default ActivateAccount;