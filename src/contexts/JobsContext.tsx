import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  education: string;
  source: 'Umurava' | 'External';
  addedAt: string;
  position?: string;
}

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
  position: string;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  shortlisted: boolean;
  whyNot?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'open' | 'screening' | 'closed';
  skills: string[];
  experience: number;
  education: string;
  candidates: Candidate[];
  results: ScreeningResult[];
  createdAt: string;
}

interface JobsContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'candidates' | 'results' | 'createdAt'>) => Job;
  updateJob: (id: string, data: Partial<Job>) => void;
  getJob: (id: string) => Job | undefined;
  addCandidates: (jobId: string, candidates: Omit<Candidate, 'id' | 'addedAt'>[]) => void;
  setResults: (jobId: string, results: ScreeningResult[]) => void;
}

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);

  const addJob = useCallback((data: Omit<Job, 'id' | 'candidates' | 'results' | 'createdAt'>) => {
    const job: Job = {
      ...data,
      id: crypto.randomUUID(),
      candidates: [],
      results: [],
      createdAt: new Date().toISOString(),
    };
    setJobs(prev => [...prev, job]);
    return job;
  }, []);

  const updateJob = useCallback((id: string, data: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...data } : j));
  }, []);

  const getJob = useCallback((id: string) => {
    return jobs.find(j => j.id === id);
  }, [jobs]);

  const addCandidates = useCallback((jobId: string, candidates: Omit<Candidate, 'id' | 'addedAt'>[]) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const newCandidates = candidates.map(c => ({
        ...c,
        id: crypto.randomUUID(),
        addedAt: new Date().toISOString(),
      }));
      return { ...j, candidates: [...j.candidates, ...newCandidates] };
    }));
  }, []);

  const setResults = useCallback((jobId: string, results: ScreeningResult[]) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, results, status: 'screening' as const } : j));
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, addJob, updateJob, getJob, addCandidates, setResults }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within JobsProvider');
  return ctx;
}
