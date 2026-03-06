export type ProgramStatus = "PLANNED" | "ACTIVE" | "PAUSED" | "COMPLETED";
export type ProgramCategory =
  | "FITNESS"
  | "MENTAL_WELLNESS"
  | "NUTRITION"
  | "YOGA"
  | "MINDFULNESS"
  | "WELLNESS";

export interface ProgramResponseDTO {
  programId: number;
  programName: string;
  programDescription: string;
  startDate: string;
  endDate: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  status: ProgramStatus;
  category: ProgramCategory;
  createdTime: string;
  updatedTime: string;
  createdByAdminId: number;
  visibility?: string;
}

export interface ProgramCreateRequestDTO {
  programName: string;
  programDescription: string;
  startDate: string;
  endDate: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  category: ProgramCategory;
}

export interface ProgramUpdateRequestDTO {
  programName: string;
  programDescription: string;
  category: ProgramCategory;
}

export interface ProgramDateUpdateRequestDTO {
  startDate: string;
  endDate: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
}

export interface ProgramSearchParams {
  status?: ProgramStatus | "";
  category?: ProgramCategory | "";
}
