import axios from "axios";

// Single axios instance for the entire integrated app.
// The backend runs on port 8089 (see backendIntegration/application.properties)
const axiosInstance = axios.create({
  baseURL: "http://localhost:8089",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401/403 → force logout
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const data = error.response?.data;
      const hasBody =
        data &&
        (typeof data === "string"
          ? data.trim().length > 0
          : Object.keys(data).length > 0);
      if (!hasBody) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
