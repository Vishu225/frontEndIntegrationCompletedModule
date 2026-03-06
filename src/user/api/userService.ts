import axiosInstance from "../../shared/axiosInstance";

export const viewAllUsers = () => axiosInstance.get("/viewAllUsers");
export const viewProfile = (userId: number) =>
  axiosInstance.get(`/viewProfile/${userId}`);
export const updateProfile = (data: object) =>
  axiosInstance.put("/updateProfile", data);
export const deleteProfile = (userId: number) =>
  axiosInstance.delete(`/deleteProfile/${userId}`);
export const addUser = (data: object) => axiosInstance.post("/register", data);
export const updateUserAdmin = (data: object) =>
  axiosInstance.put("/updateUserAdmin", data);
export const deleteUserAdmin = (id: number) =>
  axiosInstance.delete(`/deleteUserAdmin/${id}`);
export const loginUser = (data: object) =>
  axiosInstance.post("/login", data, { responseType: "text" } as object);
export const registerUser = (data: object) =>
  axiosInstance.post("/register", data);
