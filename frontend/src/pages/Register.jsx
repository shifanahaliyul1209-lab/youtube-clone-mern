import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";

// Register page: validates the fields, then redirects to the login page
function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Check every field and return a message for each wrong one
  const validate = () => {
    const e = {};
    if (form.username.trim().length < 3) e.username = "Username must be at least 3 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      await api.post("/auth/register", form);
      navigate("/login", { state: { registered: true } }); // go to the login page
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h2>Create your account</h2>

        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} />
        {errors.username && <p className="field-error">{errors.username}</p>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <p className="field-error">{errors.password}</p>}

        {serverError && <p className="field-error">{serverError}</p>}

        <button type="submit" className="auth-btn">Register</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;