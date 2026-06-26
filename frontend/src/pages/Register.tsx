import { useState, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

interface RegisterResponse {
  message?: string;
  id?: string;
  error?: string;
}

function Register() {

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleRegister = async (): Promise<void> => {

    try {

      const response = await axios.post<RegisterResponse>(
        "http://127.0.0.1:8000/register/",
        {
          username,
          email,
          password
        }
      );

      alert(response.data.message || "Registration Successful");

      navigate("/");

    } catch (error: any) {

      console.log(error);

      if (axios.isAxiosError(error) && error.response?.data?.error) {

        alert(error.response.data.error);

      } else {

        alert("Registration Failed");
      }
    }
  };

  return (
    <div>

      <h1>Register Page</h1>

      <label htmlFor="username">Username</label>
      <br />

      <input
        id="username"
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <br /><br />

      <label htmlFor="email">Email</label>
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

      <label htmlFor="password">Password</label>
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

      <button onClick={handleRegister}>
        Register
      </button>

      <p>
        Already have an account?
        <Link to="/"> Login</Link>
      </p>

    </div>
  );
}

export default Register;