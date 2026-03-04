import { create } from 'zustand';
import { JobService } from '@/services/jobService';
import type { Job } from '@/services/mockData/jobs';

interface JobState {
  activeJobs: Record<string, Job>;
  startJob: (name: string) => Promise<string>;
  pollJob: (id: string) => Promise<void>;
  clearJob: (id: string) => void;
}

export const useJobStore = create<JobState>((set) => ({
  activeJobs: {},
  
  startJob: async (name: string) => {
    const id = await JobService.startJob(name);
    // Initial fetch to get it into the store
    const job = await JobService.getJobStatus(id);
    set(state => ({
      activeJobs: { ...state.activeJobs, [id]: job }
    }));
    return id;
  },
  
  pollJob: async (id: string) => {
    try {
      const job = await JobService.getJobStatus(id);
      set(state => ({
        activeJobs: { ...state.activeJobs, [id]: job }
      }));
    } catch {
      // Background poll failure handling if needed
    }
  },
  
  clearJob: (id: string) => {
    set(state => {
      const next = { ...state.activeJobs };
      delete next[id];
      return { activeJobs: next };
    });
  }
}));
