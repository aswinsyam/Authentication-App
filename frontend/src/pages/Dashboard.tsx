import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types/User";

function Dashboard() {

  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {

    const fetchProfile = async (): Promise<void> => {

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

      } catch (error: any) {

        console.log(error);

        if (error.response?.status === 401) {

          localStorage.clear();

          setUser("");

          navigate("/");
        }
      }
    };

    fetchProfile();

  }, [navigate, setUser]);

  const logout = (): void => {

    localStorage.clear();

    setUser("");

    navigate("/");
  };

  return (

    <div>

      <h1>Dashboard</h1>

      <h2>Welcome {user} 🎉</h2>

      {profile && (

        <div>

          {profile.profile_image ? (

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

          ) : (

            <p>No Profile Image</p>

          )}

          <h3>{profile.username}</h3>

          <p>{profile.email}</p>

        </div>

      )}

      <br />

      <button
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </button>

      <br /><br />

      <button
        onClick={logout}
      >
        Logout
      </button>

    </div>

  );
}

export default Dashboard;
