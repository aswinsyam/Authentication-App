import { useState, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

interface ApiResponse {
  message?: string;
  error?: string;
}

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [image, setImage] = useState<File | null>(null);

  const [preview, setPreview] = useState("");



  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));

  };



  const handleRegister = async () => {

    try {

      const formData = new FormData();

      formData.append("username", username);

      formData.append("email", email);

      formData.append("password", password);

      if (image) {

        formData.append("image", image);

      }

      const response = await axios.post<ApiResponse>(
        "http://127.0.0.1:8000/register/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);

      navigate("/");

    }

    catch (error: any) {

      console.log(error);

      if (axios.isAxiosError(error)) {

        alert(
          error.response?.data?.error ||
          "Registration Failed"
        );

      }

      else {

        alert("Something went wrong");

      }

    }

  };



  return (

    <div>

      <h1>Register</h1>

      <label htmlFor="username">
        Username
      </label>

      <br />

      <input
        id="username"
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <label htmlFor="email">
        Email
      </label>

      <br />

      <input
        id="email"
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <label htmlFor="image">
        Profile Image (Optional)
      </label>

      <br />

      <input
        id="image"
        type="file"
        accept="image/*"
        onChange={handleImage}
      />

      <br /><br />

      {preview && (

        <img
          src={preview}
          alt="Preview"
          width="150"
          height="150"
          style={{
            borderRadius: "50%",
            objectFit: "cover"
          }}
        />

      )}

      <br /><br />

      <button onClick={handleRegister}>
        Register
      </button>

      <p>

        Already have an account?

        <Link to="/">
          {" "}Login
        </Link>

      </p>

    </div>

  );

}

export default Register;