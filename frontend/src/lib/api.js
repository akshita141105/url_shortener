import axios from "axios";

/**
 * Axios instance with automatic token refresh on 401
 * Handles authentication token refresh without requiring user re-login
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// Track in-flight refresh so multiple parallel 401s don't trigger
// multiple refresh calls at once.
let isRefreshing = false;
let pendingQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 */
const processQueue = (error) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    pendingQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401s, and only retry once per request
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Don't try to refresh if the failing request WAS the refresh call itself,
        // the login/register calls (bad credentials, not expired session),
        // or the "who am I" check (401 here just means "not logged in yet").
        if (
            originalRequest.url?.includes("/auth/refresh") ||
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/me")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            // Wait for the in-flight refresh to finish, then retry this request
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            // Backend sets new accessToken/refreshToken cookies on success
            await api.post("/auth/refresh");
            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            // Refresh token itself is invalid/expired - send user to login.
            // Guard against redirect loop if already on the login page.
            if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login"
            ) {
                window.location.href = "/login";
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
