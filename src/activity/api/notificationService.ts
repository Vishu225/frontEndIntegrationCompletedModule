import axiosInstance from "../../shared/axiosInstance";

export const getNotifications = (userId: string, page = 0, size = 10) =>
  axiosInstance.get(
    `/api/notifications/user/${userId}?page=${page}&size=${size}`,
  );

export const subscribeSSE = (userId: string): EventSource => {
  const token = localStorage.getItem("token");
  const url = `http://localhost:8089/api/notifications/subscribe/${userId}${token ? `?token=${token}` : ""}`;
  return new EventSource(url);
};
