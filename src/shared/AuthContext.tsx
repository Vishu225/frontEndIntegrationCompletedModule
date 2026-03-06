import { createContext, useContext, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axiosInstance";

interface JwtPayload {
  sub: string; // email
  role: string; // e.g. "ROLE_ADMIN"
  exp: number;
}

interface UserRecord {
  userId: number;
  name: string;
  email: string;
}

export interface AuthContextType {
  token: string | null;
  email: string | null;
  name: string | null;
  role: string | null; // "ADMIN" | "MANAGER" | "EMPLOYEE"
  userId: number | null;
  isAuthenticated: boolean;
  login: (token: string, manualUserId?: number) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize auth state synchronously from localStorage so children
  // (e.g. ProtectedRoute) don't briefly see "unauthenticated" on refresh.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem("email"),
  );
  const [name, setName] = useState<string | null>(() =>
    localStorage.getItem("userName"),
  );
  const [role, setRole] = useState<string | null>(() =>
    localStorage.getItem("role"),
  );
  const [userId, setUserId] = useState<number | null>(() => {
    const v = localStorage.getItem("userId");
    return v ? Number(v) : null;
  });

  const login = async (
    rawToken: string,
    manualUserId?: number,
  ): Promise<void> => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setUserId(null);
    setName(null);

    const decoded = jwtDecode<JwtPayload>(rawToken);
    const userEmail = decoded.sub;
    const rawRole = decoded.role ?? "";
    const normalizedRole = rawRole.replace("ROLE_", "");

    setToken(rawToken);
    setEmail(userEmail);
    setRole(normalizedRole);

    localStorage.setItem("token", rawToken);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("role", normalizedRole);
    // also store with "userRole" key for activity module compatibility
    localStorage.setItem("userRole", rawRole);
    localStorage.setItem("userEmail", userEmail);

    // If a userId was provided manually (non-ADMIN flow), use it directly
    if (manualUserId != null) {
      setUserId(manualUserId);
      localStorage.setItem("userId", String(manualUserId));
      // Try to fetch display name via /viewProfile (EMPLOYEE only)
      try {
        const profileRes = await axiosInstance.get<UserRecord>(
          `/viewProfile/${manualUserId}`,
        );
        setName(profileRes.data.name);
        localStorage.setItem("userName", profileRes.data.name);
      } catch {
        // Non-fatal — name stays null for MANAGER (endpoint is EMPLOYEE-only)
      }
      return;
    }

    // ADMIN path: resolve name + userId via /viewAllUsers
    try {
      const res = await axiosInstance.get<UserRecord[]>("/viewAllUsers");
      const found = res.data.find(
        (u) => u.email.toLowerCase() === userEmail.toLowerCase(),
      );
      if (found) {
        setUserId(found.userId);
        setName(found.name);
        localStorage.setItem("userId", String(found.userId));
        localStorage.setItem("userName", found.name);
      }
    } catch {
      // Non-fatal — name will remain null
    }
  };

  const logout = (): void => {
    localStorage.clear();
    setToken(null);
    setEmail(null);
    setName(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        name,
        role,
        userId,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
