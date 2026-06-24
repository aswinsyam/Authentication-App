import { useState, ChangeEvent } from "react";
import axios from "axios";

interface ApiResponse {
  message: string;
}

function EditProfile() {

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const handleUpdate = async (): Promise<void> => {

    try {

      const response = await axios.put<ApiResponse>(
        "http://127.0.0.1:8000/update-profile/",
        {
          email,
          username,
          new_email: newEmail
        }
      );

      alert(response.data.message);

    } catch (error) {

      console.log(error);

      alert("Update Failed");
    }
  };

  const uploadImage = async (): Promise<void> => {

    try {

      if (!image) {
        alert("Please select an image");
        return;
      }

      const formData = new FormData();

      formData.append("email", email);
      formData.append("image", image);

      const response = await axios.post<ApiResponse>(
        "http://127.0.0.1:8000/upload-profile-image/",
        formData
      );

      alert(response.data.message);

    } catch (error) {

      console.log(error);

      alert("Image Upload Failed");
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
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setImage(e.target.files?.[0] || null)
        }
      />

      <br /><br />

      <button onClick={uploadImage}>
        Upload Image
      </button>

      <br /><br />

      <button onClick={handleUpdate}>
        Update Profile
      </button>

    </div>
  );
}

export default EditProfile;