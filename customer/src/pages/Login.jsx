import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/auth.service";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggle

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.location.href = "/";
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome to FoodHub</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          style={styles.input} 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        
        {/* Password Container */}
        <div style={styles.passwordContainer}>
          <input 
            style={styles.inputPassword} 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <button 
            type="button" 
            style={styles.toggleButton} 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button 
          style={{...styles.button, opacity: loading ? 0.7 : 1}} 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={styles.text}>
        Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
      </p>
    </div>
  );
}

const styles = {
  container: { 
    width: "100%", maxWidth: "350px", margin: "50px auto", textAlign: "center", 
    padding: "30px", border: "1px solid #eee", borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)", backgroundColor: "#fff"
  },
  title: { marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "12px", borderRadius: "6px", border: "1px solid #ccc", outline: "none" },
  
  /* New styles for password field */
  passwordContainer: { position: "relative", display: "flex", alignItems: "center" },
  inputPassword: { padding: "12px", borderRadius: "6px", border: "1px solid #ccc", outline: "none", width: "100%", paddingRight: "60px" },
  toggleButton: { 
    position: "absolute", right: "10px", background: "none", border: "none", 
    color: "#f97316", fontWeight: "bold", cursor: "pointer", fontSize: "12px" 
  },
  
  button: { 
    padding: "12px", backgroundColor: "#f97316", color: "white", border: "none", 
    borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" 
  },
  text: { marginTop: "20px", fontSize: "14px", color: "#666" },
  link: { color: "#f97316", textDecoration: "none", fontWeight: "bold" }
};

export default Login;