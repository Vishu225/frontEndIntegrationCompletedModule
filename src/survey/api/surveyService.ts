import axiosInstance from "../../shared/axiosInstance";

export interface Program {
  programId: number;
  programName: string;
  description?: string;
}

export interface Survey {
  surveyId: number;
  title: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  anonymous: boolean;
  programId?: number; // not always present (nested object instead)
  program?: Program; // backend returns nested ProgramModel
  createdAt?: string;
}

export interface Question {
  questionId: number;
  questionText: string;
  questionType: string;
  questionOrder?: number;
  required: boolean;
  surveyId?: number;
}

export interface AnswerDTO {
  questionId: number;
  answerValue: string;
}

export interface CreateSurveyPayload {
  title: string;
  description?: string;
  anonymous: boolean;
  programId: number;
  createdById: number;
}

export interface AddQuestionPayload {
  questionText: string;
  questionType: string;
  questionOrder: number;
  required: boolean;
}

export const surveyService = {
  // Admin endpoints
  createSurvey: (payload: CreateSurveyPayload) =>
    axiosInstance.post("/api/surveys/create", payload),

  activateSurvey: (surveyId: number) =>
    axiosInstance.put(`/api/surveys/${surveyId}/activate`),

  closeSurvey: (surveyId: number) =>
    axiosInstance.patch(`/api/surveys/${surveyId}/close`),

  deleteSurvey: (surveyId: number) =>
    axiosInstance.delete(`/api/surveys/${surveyId}?force=true`),

  getSurveyById: (surveyId: number) =>
    axiosInstance.get(`/api/surveys/${surveyId}`),

  addQuestion: (surveyId: number, payload: AddQuestionPayload) =>
    axiosInstance.post(`/api/surveys/${surveyId}/questions`, payload),

  getSurveyResponses: (surveyId: number) =>
    axiosInstance.get(`/api/surveys/responses/${surveyId}/answers`),

  getDraftSurveys: () => axiosInstance.get("/api/surveys/draft"),

  getActivePrograms: () =>
    axiosInstance.get("/api/programs/allprograms/active"),

  // Employee endpoints
  getActiveSurveys: () => axiosInstance.get("/api/surveys/active"),

  getClosedSurveys: () => axiosInstance.get("/api/surveys/closed"),

  getQuestionsBySurvey: (surveyId: number) =>
    axiosInstance.get(`/api/surveys/${surveyId}/questions`),

  submitSurvey: (
    surveyId: number,
    userId: number | string,
    answers: AnswerDTO[],
  ) =>
    axiosInstance.post(`/api/surveys/${surveyId}/submit`, {
      userId: Number(userId),
      answers,
    }),
};
