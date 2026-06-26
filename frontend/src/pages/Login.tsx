import { useState, useContext, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

interface LoginResponse {
  username: string;
  tokens: {
    access: string;
    refresh: string;
  };
}

function Login() {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogin = async (): Promise<void> => {

    try {

      const response = await axios.post<LoginResponse>(
        "http://127.0.0.1:8000/login/",
        {
          email,
          password
        }
      );

      const data = response.data;

      localStorage.setItem(
        "access_token",
        data.tokens.access
      );

      localStorage.setItem(
        "username",
        data.username
      );

      localStorage.setItem(
        "email",
        email
      );

      setUser(data.username);

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error: any) {

      console.log(error);

      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div>

      <h1>Login Page</h1>

      <label htmlFor="email">
        Email
      </label>

      <br />

      <input
        id="email"
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />

      <br /><br />

      <label htmlFor="password">
        Password
      </label>

      <br />

      <input
        id="password"
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>

      <p>
        Don't have an account?
        <Link to="/register"> Register</Link>
      </p>

    </div>
  );
}

export default Login;