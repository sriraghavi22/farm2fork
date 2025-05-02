import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

// ✅ Attach Access Token to Requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token.trim()}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle Token Expiration (Auto-Refresh)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("🔄 Access token expired. Attempting to refresh...");
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    console.error("❌ No refresh token. Logging out.");
                    throw new Error("No refresh token available.");
                }

                // ✅ Request a new access token using the refresh token
                const { data } = await axios.post("http://localhost:5000/api/auth/refresh", { refreshToken });

                console.log("✅ New access token received:", data.accessToken);

                // ✅ Store the new access token
                localStorage.setItem("accessToken", data.accessToken);

                // ✅ Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("❌ Token refresh failed:", refreshError);

                // ✅ Logout user if refresh fails
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;