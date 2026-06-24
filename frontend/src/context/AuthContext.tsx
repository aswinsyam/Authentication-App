import { createContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<string>(
    localStorage.getItem("username") || ""
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;