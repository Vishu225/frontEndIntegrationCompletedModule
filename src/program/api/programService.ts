import axiosInstance from "../../shared/axiosInstance";
import type {
  ProgramCreateRequestDTO,
  ProgramUpdateRequestDTO,
  ProgramDateUpdateRequestDTO,
  ProgramResponseDTO,
  ProgramSearchParams,
} from "./program.types";

export async function createProgram(
  data: ProgramCreateRequestDTO,
): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.post<ProgramResponseDTO>(
    "/api/programs/create",
    data,
  );
  return res.data;
}

export async function getAllPrograms(): Promise<ProgramResponseDTO[]> {
  const res = await axiosInstance.get("/api/programs/allprograms");
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export async function getProgramById(id: number): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.get<ProgramResponseDTO>(
    `/api/programs/allprograms/${id}`,
  );
  return res.data;
}

export async function searchPrograms(
  params: ProgramSearchParams,
): Promise<ProgramResponseDTO[]> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.category) query.append("category", params.category);
  const res = await axiosInstance.get(
    `/api/programs/allprograms/search?${query.toString()}`,
  );
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export async function updateProgram(
  id: number,
  data: ProgramUpdateRequestDTO,
): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.put<ProgramResponseDTO>(
    `/api/programs/${id}/update`,
    data,
  );
  return res.data;
}

export async function updateProgramDates(
  id: number,
  data: ProgramDateUpdateRequestDTO,
): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.put<ProgramResponseDTO>(
    `/api/programs/${id}/updatedates`,
    data,
  );
  return res.data;
}

export async function pauseProgram(id: number): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.patch<ProgramResponseDTO>(
    `/api/programs/${id}/pause`,
  );
  return res.data;
}

export async function resumeProgram(id: number): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.patch<ProgramResponseDTO>(
    `/api/programs/${id}/resume`,
  );
  return res.data;
}

export async function toggleProgramVisibility(
  id: number,
): Promise<ProgramResponseDTO> {
  const res = await axiosInstance.put<ProgramResponseDTO>(
    `/api/programs/${id}/visibility`,
  );
  return res.data;
}

export async function deleteProgram(id: number): Promise<void> {
  await axiosInstance.delete(`/api/programs/${id}/delete`);
}
