export type JobStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  progress: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  error?: string;
}

// In-memory job queue for the mock database
export const mockJobs: Record<string, Job> = {};
