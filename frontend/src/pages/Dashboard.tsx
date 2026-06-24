import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types/User";

function Dashboard() {

  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {

    const fetchProfile = async (): Promise<void> => {

      try {

        const email = localStorage.getItem("email");

        const response = await axios.get<User>(
          "http://127.0.0.1:8000/profile/",
          {
            params: {
              email
            }
          }
        );

        setUsers([response.data]);

      } catch (error) {

        console.log(error);
      }
    };

    fetchProfile();

  }, []);

  const logout = (): void => {

    localStorage.clear();
    setUser("");

    navigate("/");
  };

  return (
    <div>

      <h1>Dashboard</h1>

      <h2>Welcome {user} 🎉</h2>

      {users.map((user) => (
        <div key={user._id}>

          {user.profile_image && (
            <img
              src={`http://127.0.0.1:8000/media/${user.profile_image}`}
              alt="Profile"
              width="150"
              height="150"
            />
          )}

          <h3>{user.username}</h3>

          <p>{user.email}</p>

        </div>
      ))}

      <button
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </button>

      <br /><br />

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}

export default Dashboard;