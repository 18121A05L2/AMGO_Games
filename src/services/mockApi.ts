export async function simulateDelay(ms: number = 800) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulateErrorRate(failureProbability: number = 0.1) {
  if (Math.random() < failureProbability) {
    throw new Error('Simulated network error');
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
