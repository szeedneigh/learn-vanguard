import logger from "@/utils/logger";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { environment } from "@/config/environment";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// Role normalization
export const normalizeRole = (role) => {
  if (!role) return "";
  const roleMap = {
    ADMIN: "admin",
    PIO: "pio",
    STUDENT: "student",
  };
  return roleMap[role.toUpperCase()] || role.toLowerCase();
};
// API error handling
export const handleApiError = (error) => {
  if (error?.response?.data?.error) {
    return {
      message: error.response.data.error.message,
      code: error.response.data.error.code,
      details: error.response.data.error.details,
    };
  }
  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    details: null,
// Authentication state check
export const checkAuthState = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  return token;
// API connection check with improved error handling
export const checkApiConnection = async (baseUrl) => {
  logger.log("Checking API connection to:", baseUrl);
  // Create a controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  try {
    // Try the health check endpoint first
    const healthUrl = baseUrl.endsWith("/api")
      ? baseUrl.replace(/\/api$/, "/health")
      : baseUrl + "/health";
    const response = await fetch(healthUrl, {
      signal: controller.signal,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      logger.log("API health check successful");
      return true;
    }
    // If health check fails, try a fallback HEAD request to the base URL
    logger.log("Health check failed, attempting fallback check");
    return await fallbackConnectionCheck(baseUrl);
  } catch (error) {
    logger.error("API connection check failed:", error);
    if (error.name === "AbortError") {
      logger.error("API health check timed out after 5 seconds");
    // Try fallback method if the first attempt fails
// Fallback connection check method
export const fallbackConnectionCheck = async (baseUrl) => {
  logger.log("Attempting fallback connection check to:", baseUrl);
  const timeoutId = setTimeout(() => controller.abort(), 5000);
    // Try a basic HEAD request which most servers accept
    const response = await fetch(baseUrl, {
      method: "HEAD",
    if (response.ok || response.status === 404) {
      // 404 is acceptable, means server is running
      logger.log("Fallback connection check successful");
    logger.warn("Fallback connection check failed:", response.status);
    return false;
    logger.error("Fallback connection check failed:", error);
// Export API_BASE_URL from environment configuration
export const API_BASE_URL = environment.API_BASE_URL;
// Headers generator
export const getAuthHeaders = (token = null) => {
  const authToken = token || localStorage.getItem("token");
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
// Response handler
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "API request failed");
  return response.json();
