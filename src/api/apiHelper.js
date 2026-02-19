import Constants from "../utils/constants";
import axios from "axios";
import ApiEndpoits from "./apiEndPoints";

// Create axios instance for Laravel API
const instance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`, // Correct way in Vite
});
  

// Add request interceptor: Bearer token for all requests except login
instance.interceptors.request.use(
    function (config) {
      const isLoginRequest = config.url && (config.url.includes("login") || config.url.endsWith("/login"));
      if (isLoginRequest) {
        config.headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        return config;
      }

      const token = localStorage.getItem(Constants.localStorageKey.accessToken);
      const tokenType = localStorage.getItem(Constants.localStorageKey.tokenType) || "Bearer";
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `${tokenType} ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        };
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  

// Add response interceptor
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Export API methods
export const GET = (url, config) =>
  instance.get(url, config).catch((error) => error?.response);

export const POST = (url, data, config) =>
  instance.post(url, data, config).catch((error) => error?.response);

// Wrapper for today's store gold rate
export const getStoreGoldRate = (payload) =>
  POST(ApiEndpoits.storeGoldRate, payload);

// Get schemes by mobile number (current enrollments)
export const getSchemesByMobileNumber = (mobileNumber) =>
  GET(`${ApiEndpoits.getSchemesByMobileNumber}?MobileNumber=${encodeURIComponent(mobileNumber)}`);
