import { mockJobs } from './mockData/jobs';
import type { Job } from './mockData/jobs';
import { simulateDelay, simulateErrorRate } from './mockApi';

export const JobService = {
  async startJob(name: string): Promise<string> {
    await simulateDelay(300);
    const id = `job-${Date.now()}`;
    mockJobs[id] = {
      id,
      name,
      status: 'Pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Kick off the background simulation to mimic a backend task
    setTimeout(() => simulateJobLifecycle(id), 2000);
    return id;
  },

  async getJobStatus(id: string): Promise<Job> {
    await simulateDelay(200);
    // Probabilistic fetching error to test UI fault tolerance
    await simulateErrorRate(0.05);
    
    const job = mockJobs[id];
    if (!job) throw new Error('Job not found');
    return { ...job };
  }
};

async function simulateJobLifecycle(id: string) {
  const job = mockJobs[id];
  if (!job) return;

  job.status = 'Processing';
  job.updatedAt = new Date().toISOString();

  const totalSteps = Math.floor(Math.random() * 5) + 5; // 5-10 steps
  for (let step = 1; step <= totalSteps; step++) {
    // Wait between 1 and 2 seconds per tick
    await new Promise(res => setTimeout(res, 1000 + Math.random() * 1000));
    
    const currentJob = mockJobs[id];
    if (!currentJob || currentJob.status !== 'Processing') return; 
    
    // Simulate random failure during processing (10% chance per step)
    if (Math.random() < 0.1) {
      currentJob.status = 'Failed';
      currentJob.error = 'An unexpected error occurred during processing.';
      currentJob.updatedAt = new Date().toISOString();
      return;
    }

    currentJob.progress = Math.floor((step / totalSteps) * 100);
    currentJob.updatedAt = new Date().toISOString();
  }

  // Determine final success or edge case failure right at the end
  const finalJob = mockJobs[id];
  if (Math.random() < 0.05) {
      finalJob.status = 'Failed';
      finalJob.error = 'Simulation completed but failed validation.';
  } else {
      finalJob.status = 'Completed';
      finalJob.progress = 100;
  }
  finalJob.updatedAt = new Date().toISOString();
}
