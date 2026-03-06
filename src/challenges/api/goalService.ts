import axiosInstance from "../../shared/axiosInstance";

export interface IGoal {
  goalId: number;
  title: string;
  endDate: string;
  progress: number;
  totalProgress: number;
  status: string;
  completionPercent: number;
}

export const getAllGoals = (userId: string | number) =>
  axiosInstance.get(`/api/${userId}/myGoals`);
export const getGoalHistory = (userId: string | number) =>
  axiosInstance.get(`/api/${userId}/goals/goalHistory`);
export const insertGoal = (
  userId: string | number,
  goal: Omit<IGoal, "goalId" | "completionPercent">,
) => axiosInstance.post(`/api/${userId}/createGoal`, goal);
export const updateGoal = (userId: string | number, goal: IGoal) =>
  axiosInstance.patch(`/api/${userId}/updateGoal/${goal.goalId}`, goal);
export const deleteGoal = (userId: string | number, goalId: number) =>
  axiosInstance.delete(`/api/${userId}/deleteGoal/${goalId}`);
