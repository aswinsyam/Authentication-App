import { useState, ChangeEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

interface ApiResponse {
  message: string;
}

function EditProfile() {

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);

  const handleUpdate = async (): Promise<void> => {

    try {

      // Update Username & Email
      await axios.put<ApiResponse>(
        "http://127.0.0.1:8000/update-profile/",
        {
          email,
          username,
          new_email: newEmail
        }
      );

      // Upload Image (if selected)
      if (image) {

        const formData = new FormData();

        formData.append("email", email);
        formData.append("image", image);

        await axios.post<ApiResponse>(
          "http://127.0.0.1:8000/upload-profile-image/",
          formData
        );
      }

      // Email Changed -> Logout
      if (newEmail && newEmail !== email) {

        alert("Email updated successfully. Please login again.");

        localStorage.clear();

        setUser("");

        navigate("/");

        return;
      }

      // Username Changed
      if (username) {

        localStorage.setItem(
          "username",
          username
        );

        setUser(username);
      }

      alert("Profile Updated Successfully");

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      alert("Update Failed");
    }
  };

  return (
    <div>

      <h1>Edit Profile</h1>

      <label htmlFor="currentEmail">
        Current Email
      </label>

      <br />

      <input
        id="currentEmail"
        type="email"
        placeholder="Current Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />

      <br /><br />

      <label htmlFor="newUsername">
        New Username
      </label>

      <br />

      <input
        id="newUsername"
        type="text"
        placeholder="New Username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <br /><br />

      <label htmlFor="newEmail">
        New Email
      </label>

      <br />

      <input
        id="newEmail"
        type="email"
        placeholder="New Email"
        value={newEmail}
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

    </div>
  );
}

export default EditProfile;