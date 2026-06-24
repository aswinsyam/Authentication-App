import { useState, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

interface RegisterResponse {
  message: string;
  id: string;
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

      console.log(response.data);

      alert("Registration Successful");

      navigate("/");

    } catch (error) {

      console.log(error);

      alert("Registration Failed");
    }
  };

  return (
    <div>

      <h1>Register Page</h1>

      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <br /><br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />

      <br /><br />

      <input
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