import axiosInstance from "../../shared/axiosInstance";

export interface GoalPayload {
  title?: string;
  description?: string;
  endDate?: string;
  targetDate?: string;
  totalProgress?: number;
  progress?: number;
  status?: string;
  userId?: number;
  [key: string]: unknown;
}

export const getGoals = (userId: string) =>
  axiosInstance.get(`/api/${userId}/myGoals`);

export const createGoal = (data: GoalPayload) =>
  axiosInstance.post(`/api/${data.userId}/createGoal`, data);

export const updateGoal = (id: number, data: GoalPayload) =>
  axiosInstance.patch(`/api/${data.userId}/updateGoal/${id}`, data);

export const deleteGoal = (id: number, userId?: number | string) =>
  axiosInstance.delete(`/api/${userId ?? 0}/deleteGoal/${id}`);

export const getActivePrograms = () =>
  axiosInstance.get("/api/programs/allprograms/active");

export const getProgramChallenges = (programId: number) =>
  axiosInstance.get(`/api/${programId}/challenges`);
