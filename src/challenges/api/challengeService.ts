import axiosInstance from "../../shared/axiosInstance";

export interface IChallenge {
  challengeId: number;
  title: string;
  endDate: string;
  totalProgress: number;
  progress?: number; // optional — backend sets default 0 on create
  challengeStatus: string;
  programId?: number; // used when sending to backend
  program?: { programId: number; programName?: string }; // returned by backend
}

export interface IProgram {
  programId: number;
  programName: string;
}

export const getAllPrograms = () =>
  axiosInstance.get("/api/programs/available");
export const getChallengesByProgram = (
  programId: number,
  managerId: string | number,
) => axiosInstance.get(`/api/${programId}/challenges?managerId=${managerId}`);
export const insertChallenge = (
  programId: number,
  managerId: string | number,
  challenge: Omit<IChallenge, "challengeId">,
) =>
  axiosInstance.post(
    `/api/${programId}/createChallenge?managerId=${managerId}`,
    challenge,
  );
export const updateChallenge = (
  managerId: string | number,
  challengeId: number,
  data: Partial<IChallenge> & { status?: string },
) =>
  axiosInstance.patch(
    `/api/updateChallenge/${challengeId}?managerId=${managerId}`,
    data,
  );
export const deleteChallenge = (
  managerId: string | number,
  challengeId: number,
) =>
  axiosInstance.delete(
    `/api/deleteChallenge/${challengeId}?managerId=${managerId}`,
  );
