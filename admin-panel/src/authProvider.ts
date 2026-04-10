import { AuthProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:3001";

function decodeJwt(token: string): Record<string, any> | null {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

export const authProvider: AuthProvider = {
  login: async (params: any) => {
    // Refine's AuthPage can send { email } or { username } depending on component version
    const email = params.email || params.username;
    const password = params.password;

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (data.accessToken) {
        localStorage.setItem("caterme_token", data.accessToken);
        return { success: true, redirectTo: "/" };
      }
      return { success: false };
    } catch (err: any) {
      return {
        success: false,
        error: {
          message: "Login Failed",
          name: err?.response?.data?.message || "Invalid email or password"
        }
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("caterme_token");
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const token = localStorage.getItem("caterme_token");
    if (!token) return { authenticated: false, logout: true, redirectTo: "/login" };
    const decoded = decodeJwt(token);
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("caterme_token");
      return { authenticated: false, logout: true, redirectTo: "/login" };
    }
    return { authenticated: true };
  },
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("caterme_token");
      return { logout: true };
    }
    return { error };
  },
  getIdentity: async () => {
    const token = localStorage.getItem("caterme_token");
    if (!token) return null;
    const decoded = decodeJwt(token);
    if (!decoded) return null;
    return { id: decoded.sub, name: decoded.name || decoded.email || "Admin", email: decoded.email };
  },
  getPermissions: async () => {
    const token = localStorage.getItem("caterme_token");
    if (!token) return null;
    return decodeJwt(token)?.role ?? null;
  },
};

export default authProvider;
