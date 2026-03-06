import axiosInstance from "../../shared/axiosInstance";

export interface DataPoint<T, U> {
  x: T;
  y: U;
}
export interface GraphResponseDTO<T, U> {
  label: string;
  data: DataPoint<T, U>[];
}
export interface IReport {
  reportId?: number;
  scope: string;
  metrics: string;
  generatedDate?: string;
}
export interface IReportRequest {
  scope: string;
  metrics: string;
}
export type ChartDataPoint = { name: string; value: number };
export type ChartType = "pie" | "bar" | "line";
export interface SelectedChart {
  type: ChartType;
  data: ChartDataPoint[];
  label: string;
}

// Reports CRUD
export const getAllReports = () =>
  axiosInstance.get<IReport[]>("/api/analytics/reports");
export const createReport = (data: IReportRequest) =>
  axiosInstance.post<IReport>("/api/analytics/reports", data);
export const updateReport = (id: number, data: IReportRequest) =>
  axiosInstance.put<IReport>(`/api/analytics/reports/${id}`, data);
export const deleteReport = (id: number) =>
  axiosInstance.delete(`/api/analytics/reports/${id}`);

// Analytics Data
export const getParticipationStatus = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/participation/status",
  );
export const getDeptParticipation = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/participation/department",
  );
export const getProgramParticipation = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/participation/program",
  );
export const getMonthlyTrend = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/trend/monthly",
  );
export const getCategoryParticipation = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/participation/category",
  );
export const getGoalStatus = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/goal/status",
  );

export const getProgramStatus = () =>
  axiosInstance.get<GraphResponseDTO<string, number>>(
    "/api/analytics/program/status",
  );
