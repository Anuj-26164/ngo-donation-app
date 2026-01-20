import axios from "axios";

// Setup axios interceptor to automatically include JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle 401 errors (token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // prevent reload loop
      if (!window.location.pathname.includes("login")) {
        window.history.replaceState({}, "", "/");
      }
    }
    return Promise.reject(error);
  },
);

export default axios;
