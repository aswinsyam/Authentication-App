import { useState, useEffect, ChangeEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types/User";

interface ApiResponse {
  message?: string;
  username?: string;
  email?: string;
  error?: string;
}

function EditProfile() {

  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {

    const fetchProfile = async () => {

      const token = localStorage.getItem("access_token");

      if (!token) {

        navigate("/");

        return;
      }

      try {

        const response = await axios.get<User>(
          "http://127.0.0.1:8000/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data);

        setUsername(response.data.username);

        setNewEmail(response.data.email);

      } catch (error) {

        console.log(error);

        localStorage.clear();

        navigate("/");
      }

    };

    fetchProfile();

  }, [navigate]);



  const handleUpdate = async () => {

    const token = localStorage.getItem("access_token");

    if (!token) {

      navigate("/");

      return;
    }

    try {

      const response = await axios.put<ApiResponse>(
        "http://127.0.0.1:8000/update-profile/",
        {
          username,
          new_email: newEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (image) {

        const formData = new FormData();

        formData.append("image", image);

        await axios.post(
          "http://127.0.0.1:8000/upload-profile-image/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      }

      localStorage.setItem(
        "username",
        response.data.username || username
      );

      setUser(response.data.username || username);

      if (response.data.email) {

        localStorage.setItem(
          "email",
          response.data.email
        );

      }

      alert("Profile Updated Successfully");

      navigate("/dashboard");

    } catch (error: any) {

      console.log(error);

      if (error.response?.status === 401) {

        alert("Session expired");

        localStorage.clear();

        navigate("/");

        return;

      }

      alert(
        error.response?.data?.error ||
        "Update Failed"
      );

    }

  };



  return (

    <div>

      <h1>Edit Profile</h1>

      {profile?.profile_image && (

        <img
          src={`http://127.0.0.1:8000/media/${profile.profile_image}`}
          alt="Profile"
          width="180"
          height="180"
          style={{
            borderRadius: "50%",
            objectFit: "cover"
          }}
        />

      )}

      <br /><br />

      <label htmlFor="username">
        Username
      </label>

      <br />

      <input
        id="username"
        type="text"
        value={username}
        placeholder="Enter Username"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <br /><br />

      <label htmlFor="email">
        Email
      </label>

      <br />

      <input
        id="email"
        type="email"
        value={newEmail}
        placeholder="Enter Email"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setNewEmail(e.target.value)
        }
      />

      <br /><br />

      <label htmlFor="profileImage">
        Profile Image
      </label>

      <br />

      <input
        id="profileImage"
        type="file"
        accept="image/*"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setImage(e.target.files?.[0] || null)
        }
      />

      <br /><br />

      <button onClick={handleUpdate}>
        Update Profile
      </button>

      <br /><br />

      <button
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </button>

    </div>

  );

}

export default EditProfile;