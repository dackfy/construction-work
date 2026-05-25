import type { WorkLog, WorkLogInput, WorkType } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

type WorkLogQuery = {
  startDate?: string;
  endDate?: string;
  sort: "asc" | "desc";
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Не удалось выполнить запрос");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getWorkTypes: () => request<WorkType[]>("/work-types"),
  getWorkLogs: (query: WorkLogQuery) => {
    const params = new URLSearchParams();
    params.set("sort", query.sort);
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    return request<WorkLog[]>(`/work-logs?${params.toString()}`);
  },
  createWorkLog: (data: WorkLogInput) =>
    request<WorkLog>("/work-logs", {
      method: "POST",
      body: JSON.stringify({ ...data, volume: Number(data.volume) })
    }),
  updateWorkLog: (id: string, data: WorkLogInput) =>
    request<WorkLog>(`/work-logs/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, volume: Number(data.volume) })
    }),
  deleteWorkLog: (id: string) =>
    request<void>(`/work-logs/${id}`, {
      method: "DELETE"
    })
};
