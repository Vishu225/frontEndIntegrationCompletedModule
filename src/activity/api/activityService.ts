import axiosInstance from "../../shared/axiosInstance";

export const enrollActivity = (data: object) =>
  axiosInstance.post("/api/activity/enroll", data);

export const getActivities = (userId: string | null) =>
  axiosInstance.get(`/api/activity/getactivity/${userId}`);

export const getOngoingActivities = (userId: string | null) =>
  axiosInstance.get(`/api/activity/getOnGoiongActivity/${userId}`);

export const getCompletedActivities = (userId: string | null) =>
  axiosInstance.get(`/api/activity/getCompletedActivity/${userId}`);

export const getProgramChallengesByActivity = (programId: number) =>
  axiosInstance.get(`/api/activity/program/challenges/${programId}`);

export const deEnrollUser = (data: object) =>
  axiosInstance.put("/api/activity/deEnrollUser", data);

export const completeChallenge = (data: object) =>
  axiosInstance.post<string>("/api/activity/challenge/complete", data);

export const getEnrolledActivities = (managerId: string | null) =>
  axiosInstance.get(`/api/activity/manager/enrolled/${managerId}`);

export const enrollmentApproval = (activityId: number, action: string) =>
  axiosInstance.put(
    `/api/activity/manager/EnrollmentActivity/${activityId}/${action}`,
  );

export const getCompletionActivities = (managerId: string | null) =>
  axiosInstance.get(`/api/activity/manager/completed/${managerId}`);

export const completionApproval = (activityId: number, action: string) =>
  axiosInstance.put(
    `/api/activity/manager/CompletionActivity/${activityId}/${action}`,
  );
